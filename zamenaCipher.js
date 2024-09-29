// zamenaCipher.js

// Определяем исходный русский алфавит
const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');

// Перемешанный алфавит для шифрования (вы можете сгенерировать случайный порядок)
const shuffledAlphabet = 'ЮЯЭЬЫЪЩШЧЦХФУТСРОПНМЛКИЙЗЖЁЕДГВБА'.split('');

// Функция для шифрования с использованием простой замены
function encrypt(text) {
    return text.toUpperCase().split('').map(char => {
        const index = alphabet.indexOf(char);
        return index !== -1 ? shuffledAlphabet[index] : char; // если символ не из алфавита, оставляем его как есть
    }).join('');
}

// Функция для расшифровки
function decrypt(text) {
    return text.toUpperCase().split('').map(char => {
        const index = shuffledAlphabet.indexOf(char);
        return index !== -1 ? alphabet[index] : char; // если символ не из алфавита, оставляем его как есть
    }).join('');
}

// Экспортируем функции для использования в других файлах
module.exports = { encrypt, decrypt };
