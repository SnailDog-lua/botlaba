const fs = require('fs');

// Очищаем содержимое файла при каждом запуске
fs.writeFileSync('logfile.txt', '', 'utf8');

// Создаем поток для записи логов в файл
const logStream = fs.createWriteStream('logfile.txt', { flags: 'a' });

// Функция для записи в лог
function logToFile(message) {
    console.log(message); // Отображаем лог в консоли
    logStream.write(`${new Date().toISOString()} - ${message}\n`); // Записываем в файл
}

// Функция для перевода символа в двоичный код
function toBinary(char, bits = 16) {
    return char.charCodeAt(0).toString(2).padStart(bits, '0');
}

// Функция для преобразования двоичного кода в символ
function fromBinary(binary) {
    return String.fromCharCode(parseInt(binary, 2));
}

// Функция для выполнения операции XOR между двумя двоичными строками
function xor(bin1, bin2) {
    let result = '';
    for (let i = 0; i < bin1.length; i++) {
        result += bin1[i] === bin2[i] ? '0' : '1';
    }
    return result;
}

// Шифрование Вернама
function encryptVernam(text, key) {
    if (text === key) {
        logToFile("Предупреждение: текст и ключ совпадают. Это приведет к неправильному шифрованию");
    }

    logToFile(`Исходный текст: ${text}`);
    logToFile(`Ключ: ${key}`);

    // Преобразуем текст и ключ в двоичный код
    let binaryText = text.split('').map(char => toBinary(char)).join('');
    let binaryKey = key.split('').map(char => toBinary(char)).join('');

    logToFile(`Двоичный текст: ${binaryText}`);
    logToFile(`Двоичный ключ: ${binaryKey}`);

    // Если ключ короче текста, повторяем его до нужной длины
    while (binaryKey.length < binaryText.length) {
        binaryKey += binaryKey; // Увеличиваем ключ
    }
    binaryKey = binaryKey.slice(0, binaryText.length); // Обрезаем ключ до длины текста

    logToFile(`Двоичный ключ после выравнивания: ${binaryKey}`);

    // Применяем XOR
    const encryptedBinary = xor(binaryText, binaryKey);

    logToFile(`Зашифрованный двоичный код (XOR): ${encryptedBinary}`);

    // Кодируем результат в Base64
    const encryptedText = toBase64(encryptedBinary);
    logToFile(`Зашифрованное сообщение в Base64: ${encryptedText}`);

    return encryptedText;
}

// Расшифровка Вернама
function decryptVernam(base64Text, key) {
    logToFile(`Зашифрованное сообщение в Base64: ${base64Text}`);
    logToFile(`Ключ: ${key}`);

    // Декодируем Base64 обратно в двоичный код
    const encryptedBinary = fromBase64(base64Text);

    logToFile(`Декодированный двоичный код (из Base64): ${encryptedBinary}`);

    // Преобразуем ключ в двоичный код
    let binaryKey = key.split('').map(char => toBinary(char)).join('');

    logToFile(`Двоичный ключ: ${binaryKey}`);

    // Если ключ короче текста, повторяем его до нужной длины
    while (binaryKey.length < encryptedBinary.length) {
        binaryKey += binaryKey; // Увеличиваем ключ
    }
    binaryKey = binaryKey.slice(0, encryptedBinary.length); // Обрезаем ключ до длины зашифрованного текста

    logToFile(`Двоичный ключ после выравнивания: ${binaryKey}`);

    // Применяем XOR для расшифровки
    const decryptedBinary = xor(encryptedBinary, binaryKey);

    logToFile(`Расшифрованный двоичный код (XOR): ${decryptedBinary}`);

    // Преобразуем двоичный код обратно в текст
    const decryptedText = decryptedBinary.match(/.{1,16}/g).map(fromBinary).join('');

    logToFile(`Расшифрованное сообщение: ${decryptedText}`);

    return decryptedText;
}

// Функция для кодирования строки в Base64
function toBase64(binary) {
    const binaryString = binary.match(/.{1,8}/g) // Разбиваем строку на байты по 8 бит
        .map(byte => String.fromCharCode(parseInt(byte, 2))) // Преобразуем каждый байт в символ
        .join(''); // Объединяем все символы в строку
    return Buffer.from(binaryString, 'binary').toString('base64'); // Используем правильную кодировку
}

// Функция для декодирования строки из Base64
function fromBase64(base64) {
    const binaryString = Buffer.from(base64, 'base64').toString('binary'); // Декодируем строку из Base64
    return binaryString.split('') // Разбиваем строку на символы
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0')) // Преобразуем каждый символ в двоичный код
        .join(''); // Объединяем все биты в строку
}

// Экспортируем функции для использования в других файлах
module.exports = { encryptVernam, decryptVernam };
