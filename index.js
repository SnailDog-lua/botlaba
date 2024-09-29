require('dotenv').config()
const TelegramApi = require('node-telegram-bot-api')
const { encrypt, decrypt } = require('./zamenaCipher');
const { encryptTritemius, decryptTritemius } = require('./tritemius');
const {encryptVigenere, decryptVigenere} = require('./vigenereCipher');
const {encryptVernam, decryptVernam} = require('./vernamCipher');
const { checkMacmillanInequality } = require('./macmillan');
const bot = new TelegramApi(process.env.BOT_API_KEY, {
    polling: {
        interval: 300,
        autoStart: true
    }
})
//Импортирование опций для шифров из файла options.js
const {zamenaOptions, zamena_again, tritemusOptions, tritemius_again, vizhenerOptions, vizhener_again, vernamOptions, vernam_again, mcmillanOptions, mcmillan_again} = require('./options');

const sequelize = require('./db');
const User = require('./models/Users');

// Синхронизация базы данных
sequelize.sync({ alter: true })
    .then(() => console.log('База данных синхронизирована.'))
    .catch(err => console.error('Ошибка синхронизации базы данных:', err));


bot.on("polling_error", err => console.log(err.data.error.message));

//Переменные для понимания того, какие ключи и текста для чего используются
let waitingForKeyTritemus = false;
let waitingForKeyVigenere = false;
let waitingForTextZamena = false;
let waitingForTextTritemus = false;
let waitingForTextVigenere = false;
let waitingForKeyVernam = false;
let waitingForTextVernam = false;
let keyX = 0;
let keyY = 0;
let key = '';
let keyvigener = '';
let keyvernam = '';
let waitingForMacmillanText = false;
let waitingForMacmillanBitDepth = false;
let macmillanText = '';

//Клавиатура в главном меню
const keyboard = {
    reply_markup: {
        keyboard: [
            [{ text: 'ШИФР ПРОСТОЙ ЗАМЕНЫ' }, { text: 'ШИФР ТРИТЕМИУСА'}],
            [{ text: 'ШИФР ВИЖЕНЕРА'}, { text: 'ШИФР ВЕРНАМА'}],
            [{ text: 'НЕРАВЕСНСТВО МАКМИЛЛАНА'}],
            [{ text: 'СТАТИСТИКА'}]
        ],
        resize_keyboard: true,
        one_time_keyboard: true // Клавиатура скрывается после использования
    }
};

//Меню
const start =() => {


    bot.setMyCommands([
            {command: '/start' , description: 'Начать работу с ботом', keyboard},
            {command: '/info' , description: 'Информация о создателе'},
        ]
    )
//Обработка команд и данных для их обработки функциями шифрования
    bot.on('message', async msg => {
        const text = msg.text;
        const chatid = msg.chat.id;
        const  firstname = msg.chat.first_name;
        console.log(msg);
        const username = msg.chat.username;

        //Ожидание текста для Макмиллана
        if (waitingForMacmillanText) {
            macmillanText = text;
            waitingForMacmillanText = false; // Ожидание текста прекращается после выполнения
            waitingForMacmillanBitDepth = true; // Ожидание разрядности начинается после выполнения
            await bot.sendMessage(chatid, 'Введите разрядность (битовую глубину):');
            return;
        }
        //Ожидание разрядности
        if (waitingForMacmillanBitDepth) {
            const bitDepth = parseInt(text, 10);

            if (isNaN(bitDepth)) {
                await bot.sendMessage(chatid, 'Ошибка: Введите корректное число для разрядности.');
                return;
            }

            const result = checkMacmillanInequality(macmillanText, bitDepth);

            if (result) {
                await bot.sendMessage(chatid, 'Неравенство Макмиллана выполняется.', mcmillan_again);
            } else {
                await bot.sendMessage(chatid, 'Неравенство Макмиллана НЕ выполняется.', mcmillan_again);
            }

            waitingForMacmillanBitDepth = false; // Ожидание разрядности прекращается после выполнения
            // Запись статистики в базу данных
            const [user, created] = await User.findOrCreate({
                where: { username },
                defaults: {
                    username,
                    totalMessagesEncrypted: 0,
                    zamenaMessages: 0,
                    tritemiusMessages: 0,
                    vigenereMessages: 0,
                    vernamMessages: 0,
                    mcMillanMessages: 0
                }
            });

            await user.increment('totalMessagesEncrypted');
            await user.increment('mcMillanMessages');
            return;
        }

        //Ожидание ключей для Вернама
        if (waitingForKeyVernam) {
            keyvernam = text;
            waitingForKeyVernam = false;
            waitingForTextVernam = true;
            await bot.sendMessage(chatid, `${firstname} введите текст для шифрования:`);
            return;
        }
        //Ожидание текста для Вернама
        if (waitingForTextVernam) {
            const encryptedMessage = encryptVernam(text, keyvernam);
            const decryptedMessage = decryptVernam(encryptedMessage, keyvernam);
            await bot.sendMessage(chatid, `Зашифрованное сообщение в Base64(по другому телеграм не отображает символы): ${encryptedMessage}\nРасшифрованное сообщение: ${decryptedMessage}`, vernam_again);
            await bot.sendDocument(chatid, 'F://botlaba2//logfile.txt')
            // Запись статистики в базу данных
            const [user, created] = await User.findOrCreate({
                where: { username },
                defaults: {
                    username,
                    totalMessagesEncrypted: 0,
                    zamenaMessages: 0,
                    tritemiusMessages: 0,
                    vigenereMessages: 0,
                    vernamMessages: 0,
                    mcMillanMessages: 0
                }
            });

            await user.increment('totalMessagesEncrypted');
            await user.increment('vernamMessages');

            waitingForTextVernam = false; // Ожидание текста прекращается после выполнения
            return;
        }
        // Ожидаем ключ для виженера
        if (waitingForKeyVigenere) {
            keyvigener = text;
            waitingForKeyVigenere = false; // Ожидание ключей начинается после выполнения
            waitingForTextVigenere = true; // Ожидание текста прекращается после выполнения
            await bot.sendMessage(chatid, 'Введите текст для шифрования:');
            return;
        }
        // Ожидаем текст для виженера
        if (waitingForTextVigenere) {
            // Шифруем текст пользователя с использованием ключа
            const encryptedMessage = encryptVigenere(text, keyvigener);
            const decryptedMessage = decryptVigenere(encryptedMessage, keyvigener);
            await bot.sendMessage(chatid, `Зашифрованное сообщение: ${encryptedMessage}\nРасшифрованное сообщение: ${decryptedMessage}`, vizhener_again);
            waitingForTextVigenere = false; // Ожидание текста прекращается после выполнения
            // Запись статистики в базу данных
            const [user, created] = await User.findOrCreate({
                where: { username },
                defaults: {
                    username,
                    totalMessagesEncrypted: 0,
                    zamenaMessages: 0,
                    tritemiusMessages: 0,
                    vigenereMessages: 0,
                    vernamMessages: 0,
                    mcMillanMessages: 0
                }
            });

            await user.increment('totalMessagesEncrypted');
            await user.increment('vigenereMessages');
            return;
        }

        // Ожидаем ключ для тритемуса
        if (waitingForKeyTritemus) {
            const keys = text.trim().split(/\s+/).map(Number); // Убираем лишние пробелы и преобразуем в числа
            if (keys.length !== 2 || isNaN(keys[0]) || isNaN(keys[1])) {
                await bot.sendMessage(chatid, 'Ошибка: введите два числа, разделенные пробелом, например "3 5".');
                return;
            }
            // Присваиваем ключи
            keyX = keys[0];
            keyY = keys[1];

            waitingForKeyTritemus = false; // Ожидание ключа прекращается после выполнения
            waitingForTextTritemus = true; // Ожидание текста начинается после выполнения

            await bot.sendMessage(chatid, 'Ключ принят. Теперь введите текст для шифрования:');
            return;
        }
        // Ожидаем текст для тритемуса
        if (waitingForTextTritemus) {
            const encryptedMessage = encryptTritemius(text, keyX, keyY);
            const decryptedMessage = decryptTritemius(encryptedMessage, keyX, keyY);
            await bot.sendMessage(chatid, `Зашифрованное сообщение: ${encryptedMessage}\nРасшифрованное сообщение: ${decryptedMessage}`, tritemius_again);
            waitingForTextTritemus = false; // Ожидание текста прекращается после выполнения
            // Запись статистики в базу данных
            const [user, created] = await User.findOrCreate({
                where: { username },
                defaults: {
                    username,
                    totalMessagesEncrypted: 0,
                    zamenaMessages: 0,
                    tritemiusMessages: 0,
                    vigenereMessages: 0,
                    vernamMessages: 0,
                    mcMillanMessages: 0
                }
            });

            await user.increment('totalMessagesEncrypted');
            await user.increment('tritemiusMessages');
            return;
        }

        // Ожидаем текст для замены
        if (waitingForTextZamena) {
            const encryptedMessage = encrypt(text);
            const decryptedMessage = decrypt(encryptedMessage);
            await bot.sendMessage(chatid, `Зашифрованное сообщение: ${encryptedMessage}\nРасшифрованное сообщение: ${decryptedMessage}`, zamena_again);
            waitingForTextZamena = false; // Ожидание текста прекращается после выполнения
            // Запись статистики в базу данных
            const [user, created] = await User.findOrCreate({
                where: { username },
                defaults: {
                    username,
                    totalMessagesEncrypted: 0,
                    zamenaMessages: 0,
                    tritemiusMessages: 0,
                    vigenereMessages: 0,
                    vernamMessages: 0,
                    mcMillanMessages: 0
                }
            });

            await user.increment('totalMessagesEncrypted');
            await user.increment('zamenaMessages');
            return;
        }

        if(text === '/start') {
            await bot.sendSticker(chatid, "https://sl.combot.org/chelibob/webp/11xf09f9888.webp")
            await  bot.sendMessage(chatid, `${firstname}, добро пожаловать \n\nВыберите тип шифрования ниже:`, keyboard)
            return   console.log(msg);
        }
        if(text === '/info') {
            await bot.sendSticker(chatid, "https://sl.combot.org/chelibob/webp/29xf09fa4a8.webp")
                return  bot.sendMessage(chatid, `Бот создан *xd* из группы ||xd|| по причине того, что мне лень выполнять всё в Excel\n\nСтрок кода в общем: *787*\n\nЧасов на освоение библиотек и написание кода потрачено: *10*`,{
                parse_mode: "MarkdownV2"
            });
        }
        if(text === 'ШИФР ПРОСТОЙ ЗАМЕНЫ') {
            return bot.sendMessage(chatid, 'Выберите:', zamenaOptions)
        }
        if(text === 'ШИФР ТРИТЕМИУСА') {
            return bot.sendMessage(chatid, 'Выберите:', tritemusOptions)
        }
        if(text === 'ШИФР ВИЖЕНЕРА') {
            return bot.sendMessage(chatid, 'Выберите:', vizhenerOptions)
        }
        if(text === 'ШИФР ВЕРНАМА') {
            return bot.sendMessage(chatid, 'Выберите:', vernamOptions)
        }
        if(text === 'НЕРАВЕСНСТВО МАКМИЛЛАНА') {
            return bot.sendMessage(chatid, 'Выберите:', mcmillanOptions)
        }
        //Используется для вывода статистики
        if (text === 'СТАТИСТИКА') {
            try {
                // Получаем данные пользователя из базы данных по его username
                const user = await User.findOne({ where: { username: msg.chat.username } });

                // Если пользователь найден, выводим его статистику
                if (user) {
                    const statsMessage = `*Статистика:*\n\n` +
                        `Всего зашифрованных сообщений: ${user.totalMessagesEncrypted}\n` +
                        `Сообщений зашифровано шифром Замены: *${user.zamenaMessages}*\n` +
                        `Сообщений зашифровано шифром Тритемиуса: *${user.tritemiusMessages}*\n` +
                        `Сообщений зашифровано шифром Виженера: *${user.vigenereMessages}\n*` +
                        `Сообщений зашифровано шифром Вернама: *${user.vernamMessages}\n*` +
                        `Проверок на неравенство Макмиллана: *${user.mcMillanMessages}*`;

                    return bot.sendMessage(chatid, statsMessage, {
                        parse_mode: "MarkdownV2"
                    });
                } else {
                    // Если пользователь не найден
                    return bot.sendMessage(chatid, 'Статистика не найдена. Вы ещё не зашифровали ни одного сообщения.', {
                        parse_mode: "MarkdownV2"
                    });
                }
            } catch (error) {
                console.error('Ошибка при получении статистики:', error);
                return bot.sendMessage(chatid, 'Произошла ошибка при получении статистики.', {
                    parse_mode: "MarkdownV2"
                });
            }
        }
    })

    //Слушатель данных возвращаемых от пользователся, после получения верных данных - скрипт выполняется
    bot.on('callback_query', async msg => {
        const data = msg.data;
        const text = msg.message.text;
        const chatid = msg.message.chat.id;

        console.log(msg);

        if(data === "/info_zamena") {
            await bot.sendMessage(chatid, '``` // Определяем исходный русский алфавит\nconst alphabet = \'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ\'.split(\'\');\n\n// Перемешанный алфавит для шифрования\nconst shuffledAlphabet = \'ЮЯЭЬЫЪЩШЧЦХФУТСРОПНМЛКИЙЗЖЁЕДГВБА\'.split(\'\');\n\n// Функция для шифрования с использованием простой замены\nfunction encrypt(text) {\n    return text.toUpperCase().split(\'\').map(char => {\n        const index = alphabet.indexOf(char);\n        return index !== -1 ? shuffledAlphabet[index] : char; // если символ не из алфавита, оставляем его как есть\n    }).join(\'\');\n}\n\n// Функция для расшифровки\nfunction decrypt(text) {\n    return text.toUpperCase().split(\'\').map(char => {\n        const index = shuffledAlphabet.indexOf(char);\n        return index !== -1 ? alphabet[index] : char; // если символ не из алфавита, оставляем его как есть\n    }).join(\'\');\n}\n\n// Пример использования\nconst message = "Пример";\nconst encryptedMessage = encrypt(message);\nconsole.log("Зашифрованное сообщение: ", encryptedMessage);\n\nconst decryptedMessage = decrypt(encryptedMessage);\nconsole.log("Расшифрованное сообщение: ", decryptedMessage);\n ```', {
                parse_mode: "MarkdownV2"
            });
            return  bot.sendDocument(chatid, 'docx/zamena.docx', {
                caption: '<b>⭐️ Сделано по примеру из:</b>',
                parse_mode: 'HTML'
            });
            return bot.sendMessage(chatid, 'Не удалось отправить код или документ')
        }
        if (data === '/zamena_crypt') {
            waitingForTextZamena = true;
            await bot.sendVideo(chatid, 'gifs/zamena.gif');
            await bot.sendMessage(chatid, 'Введите текст, который нужно зашифровать:');
        }

        if(data === "/info_tritemus") {
            await bot.sendMessage(chatid, '``` // tritemiusCipher.js\n\nconst alphabet = \'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ \'.split(\'\'); // Добавляем пробел для корректного шифрования пробелов\nconst N = alphabet.length; // Количество символов в алфавите\n\n// Функция для шифрования с использованием ключа\nfunction encryptTritemius(text, keyX, keyY) {\n    return text.toUpperCase().split(\'\').map((char, index) => {\n        const m = alphabet.indexOf(char); // Позиция символа в алфавите\n        if (m === -1) return char; // Если символ не найден в алфавите, оставляем его как есть\n        const s = (index * keyX) + keyY; // s(p) = p * keyX + keyY\n        const C = (m + s) % N; // C = (m + s(p)) mod N\n        return alphabet[C];\n    }).join(\'\');\n}\n\n// Функция для расшифровки с использованием ключа\nfunction decryptTritemius(text, keyX, keyY) {\n    return text.toUpperCase().split(\'\').map((char, index) => {\n        const C = alphabet.indexOf(char); // Позиция символа зашифрованного текста в алфавите\n        if (C === -1) return char; // Если символ не найден в алфавите, оставляем его как есть\n        const s = (index * keyX) + keyY; // s(p) = p * keyX + keyY\n        const m = (C - s + N) % N; // m = (C - s(p)) mod N\n        return alphabet[m];\n    }).join(\'\');\n}\n\nmodule.exports = { encryptTritemius, decryptTritemius };```', {
                parse_mode: "MarkdownV2"
            });
            return  bot.sendDocument(chatid, 'docx/tritemus.docx', {
                caption: '<b>⭐️ Сделано по примеру из:</b>',
                parse_mode: 'HTML'
            });
            return bot.sendMessage(chatid, 'Не удалось отправить код или документ')
        }
        if (data === '/tritemus_crypt') {
            waitingForKeyTritemus = true;
            await bot.sendVideo(chatid, 'gifs/tritemus.gif');
            await bot.sendMessage(chatid, `введите ключ в формате "X Y", где X и Y — целые числа:`);
        }

        if(data === "/info_vizhener") {
            await bot.sendMessage(chatid, '``` // vigenereCipher.js\n\nconst alphabet = \'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ \'.split(\'\');\nconst N = alphabet.length;\n\n// Функция для создания цикличного ключа\nfunction generateKey(text, key) {\n    let repeatedKey = key;\n    while (repeatedKey.length < text.length) {\n        repeatedKey += key;\n    }\n    return repeatedKey.slice(0, text.length).toUpperCase();\n}\n\n// Функция для шифрования с использованием метода Виженера\nfunction encryptVigenere(text, key) {\n    const fullKey = generateKey(text, key);\n    return text.toUpperCase().split(\'\').map((char, index) => {\n        const m = alphabet.indexOf(char);\n        const k = alphabet.indexOf(fullKey[index]);\n        if (m === -1 || k === -1) return char; // если символ не найден в алфавите, пропускаем\n        const C = (m + k) % N; // С = (m + k) mod N\n        return alphabet[C];\n    }).join(\'\');\n}\n\n// Функция для расшифровки с использованием метода Виженера\nfunction decryptVigenere(text, key) {\n    const fullKey = generateKey(text, key);\n    return text.toUpperCase().split(\'\').map((char, index) => {\n        const C = alphabet.indexOf(char);\n        const k = alphabet.indexOf(fullKey[index]);\n        if (C === -1 || k === -1) return char; // если символ не найден в алфавите, пропускаем\n        const m = (C - k + N) % N; // m = (C - k) mod N\n        return alphabet[m];\n    }).join(\'\');\n}\n\nmodule.exports = { encryptVigenere, decryptVigenere };```', {
                parse_mode: "MarkdownV2"
            });
            return  bot.sendDocument(chatid, 'docx/vizhener.docx', {
                caption: '<b>⭐️ Сделано по примеру из:</b>',
                parse_mode: 'HTML'
            });
            return bot.sendMessage(chatid, 'Не удалось отправить код или документ')
        }
        if (data === '/vizhener_crypt') {
            waitingForKeyVigenere = true;
            await bot.sendVideo(chatid, 'gifs/vigener.gif');
            await bot.sendMessage(chatid, 'Введите ключ для шифрования (слово):');
        }
        if(data === "/info_vernam") {
            await bot.sendMessage(chatid, '[Ссылка на код](pastebin.com/UMkSPPd1)', {
                parse_mode: "MarkdownV2"
            });
            return  bot.sendDocument(chatid, 'docx/vernam.docx', {
                caption: '<b>⭐️ Сделано по примеру из:</b>',
                parse_mode: 'HTML'
            });
            return bot.sendMessage(chatid, 'Не удалось отправить код или документ')
        }
        if (data === '/vernam_crypt') {
            waitingForKeyVernam = true;
            await bot.sendVideo(chatid, 'gifs/vernam.gif');
            await bot.sendMessage(chatid, 'Введите ключ для шифрования (случайная строка):');
        }

        if(data === "/info_mcmillan") {
            await bot.sendMessage(chatid, '``` // macmillan.js\\n\n// Функция для подсчета количества уникальных символов\nfunction countUniqueSymbols(text) {\n    const uniqueSymbols = new Set(text);\n    return uniqueSymbols.size;\n}\n\n// Функция для проверки неравенства Макмиллана\nfunction checkMacmillanInequality(text, bitDepth) {\n    const numUniqueSymbols = countUniqueSymbols(text);\n    const macmillanValue = numUniqueSymbols / Math.pow(2, bitDepth);\n\n    return macmillanValue <= 1;  // Возвращаем true, если неравенство выполняется\n}\n\n// Экспортируем функцию для использования в других файлах\nmodule.exports = { checkMacmillanInequality };\n```', {
                parse_mode: "MarkdownV2"
            });
            await  bot.sendDocument(chatid, 'docx/mcmillan.docx', {
                caption: '<b>⭐️ Сделано по примеру из:</b>',
                parse_mode: 'HTML'
            });
            return bot.sendMessage(chatid, 'Не удалось отправить код или документ')
        }
        if (data === '/mcmillan_crypt') {
            waitingForMacmillanText = true;
            await bot.sendVideo(chatid, 'gifs/mcmillan.gif');
            await bot.sendMessage(chatid, 'Введите текст для проверки неравенства Макмиллана:');
        }

    })

    }
start()