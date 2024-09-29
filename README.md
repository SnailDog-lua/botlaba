
# 🔐 Telegram Бот для Шифрования

Все шифры и сам бот написаны на **Node.js**, для работы с API Telegram использовалась библиотека [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api). Логика шифрования была реализована с использованием встроенных возможностей **JavaScript**.

---

## 🚀 Функциональность Бота

На данный момент в боте реализованы следующие виды шифров:

1. **Шифрование простой заменой**
2. **Шифр Тритемиуса**
3. **Шифр Виженера**
4. **Шифр Вернама**

### 🔍 Дополнительные Возможности
- Для каждого шифра предоставляется **информация о шифре** и его **реализация на JavaScript**:
  - Выберите шифр → Информация о шифре и его реализация на JavaScript.
  - При нажатии на кнопку "Информация о шифре", бот отправит `.docx` файл с объяснением реализации шифра в **Excel**, на основе которого были написаны скрипты шифрования.
  
- **Пример использования** шифра: После выбора шифра и нажатия на кнопку "Приступить к шифрованию", бот отправит **видео с примером** его использования.

---

## 📊 Статистика Пользователей

Бот ведет статистику пользователей, которая доступна через кнопку **"СТАТИСТИКА"** в главном меню. Для хранения данных используется база данных **PostgreSQL**.

---

## ℹ️ Команда "/info"

При вводе команды `/info`, бот выдаёт информацию о создателе:

- **Telegram автора**: [@flokiqqe](https://t.me/flokiqqe)
- **Группа**: БИ-324

---

## 🛠️ Установка и Запуск

Для локального запуска проекта выполните следующие шаги:

1. Склонируйте репозиторий:
   ```bash
   git clone https://github.com/your-username/your-repo.git
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Запустите бота:
   ```bash
   npm start
   ```

---

## 📚 Используемые Технологии

- **Node.js** — для написания основной логики бота.
- **node-telegram-bot-api** — библиотека для работы с Telegram API.
- **JavaScript** — для реализации шифров.
- **PostgreSQL** — для хранения статистики пользователей.

---

## 🤝 Вклад

Если вы хотите внести изменения или улучшения, вы можете сделать **fork** репозитория и создать **pull request**. Мы рассмотрим ваши предложения и постараемся их включить в проект.

