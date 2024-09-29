// vigenereCipher.js

const alphabet = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ '.split('');
const N = alphabet.length;

// Функция для создания цикличного ключа
function generateKey(text, key) {
    let repeatedKey = key;
    while (repeatedKey.length < text.length) {
        repeatedKey += key;
    }
    return repeatedKey.slice(0, text.length).toUpperCase();
}

// Функция для шифрования с использованием метода Виженера
function encryptVigenere(text, key) {
    const fullKey = generateKey(text, key);
    return text.toUpperCase().split('').map((char, index) => {
        const m = alphabet.indexOf(char);
        const k = alphabet.indexOf(fullKey[index]);
        if (m === -1 || k === -1) return char; // если символ не найден в алфавите, пропускаем
        const C = (m + k) % N; // С = (m + k) mod N
        return alphabet[C];
    }).join('');
}

// Функция для расшифровки с использованием метода Виженера
function decryptVigenere(text, key) {
    const fullKey = generateKey(text, key);
    return text.toUpperCase().split('').map((char, index) => {
        const C = alphabet.indexOf(char);
        const k = alphabet.indexOf(fullKey[index]);
        if (C === -1 || k === -1) return char; // если символ не найден в алфавите, пропускаем
        const m = (C - k + N) % N; // m = (C - k) mod N
        return alphabet[m];
    }).join('');
}

module.exports = { encryptVigenere, decryptVigenere };
