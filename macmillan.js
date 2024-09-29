// macmillan.js

// Функция для подсчета количества уникальных символов
function countUniqueSymbols(text) {
    const uniqueSymbols = new Set(text);
    return uniqueSymbols.size;
}

// Функция для проверки неравенства Макмиллана
function checkMacmillanInequality(text, bitDepth) {
    const numUniqueSymbols = countUniqueSymbols(text);
    const macmillanValue = numUniqueSymbols / Math.pow(2, bitDepth);

    return macmillanValue <= 1;  // Возвращаем true, если неравенство выполняется
}

// Экспортируем функцию для использования в других файлах
module.exports = { checkMacmillanInequality };
