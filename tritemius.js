// tritemiusCipher.js

const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ '.split(''); // Добавляем пробел для корректного шифрования пробелов
const N = alphabet.length; // Количество символов в алфавите

// Функция для шифрования с использованием ключа
function encryptTritemius(text, keyX, keyY) {
    return text.toUpperCase().split('').map((char, index) => {
        const m = alphabet.indexOf(char); // Позиция символа в алфавите
        if (m === -1) return char; // Если символ не найден в алфавите, оставляем его как есть
        const s = (index * keyX) + keyY; // s(p) = p * keyX + keyY
        const C = (m + s) % N; // C = (m + s(p)) mod N
        return alphabet[C];
    }).join('');
}

// Функция для расшифровки с использованием ключа
function decryptTritemius(text, keyX, keyY) {
    return text.toUpperCase().split('').map((char, index) => {
        const C = alphabet.indexOf(char); // Позиция символа зашифрованного текста в алфавите
        if (C === -1) return char; // Если символ не найден в алфавите, оставляем его как есть
        const s = (index * keyX) + keyY; // s(p) = p * keyX + keyY
        const m = (C - s + N) % N; // m = (C - s(p)) mod N
        return alphabet[m];
    }).join('');
}

module.exports = { encryptTritemius, decryptTritemius };
