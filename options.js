module.exports = {
    //Опции для замены
    zamenaOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Информация о шифре и его реализации на javascript', callback_data: '/info_zamena'}], [{text: 'Приступить к шифрованию', callback_data: '/zamena_crypt'}]
            ]
        })
    },

//Попробовать ещё раз для замены
    zamena_again: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Зашифровать ещё раз', callback_data: '/zamena_crypt'}]
            ]
        })
    },

//Опции для тритемиуса
    tritemusOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Информация о шифре и его реализации на javascript', callback_data: '/info_tritemus'}], [{text: 'Приступить к шифрованию', callback_data: '/tritemus_crypt'}]
            ]
        })
    },

//Попробовать ещё раз для тритемиуса
    tritemius_again: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Зашифровать ещё раз', callback_data: '/tritemus_crypt'}]
            ]
        })
    },

//Опции для Виженера
    vizhenerOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Информация о шифре и его реализации на javascript', callback_data: '/info_vizhener'}], [{text: 'Приступить к шифрованию', callback_data: '/vizhener_crypt'}]
            ]
        })
    },

//Попробовать ещё раз для Виженера
    vizhener_again: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Зашифровать ещё раз', callback_data: '/vizhener_crypt'}]
            ]
        })
    },

//Опции для Вернама
    vernamOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Информация о шифре и его реализации на javascript', callback_data: '/info_vernam'}], [{text: 'Приступить к шифрованию', callback_data: '/vernam_crypt'}]
            ]
        })
    },

//Попробовать ещё раз для Вернама
    vernam_again: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Зашифровать ещё раз', callback_data: '/vernam_crypt'}]
            ]
        })
    },

//Опции для Макмиллана
    mcmillanOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{
                    text: 'Информация о шифре и его реализации на javascript',
                    callback_data: '/info_mcmillan'
                }], [{text: 'Приступить к шифрованию', callback_data: '/mcmillan_crypt'}]
            ]
        })
    },


//Попробовать ещё раз для Макмиллана
        mcmillan_again: {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{text: 'Попробовать ещё раз', callback_data: '/mcmillan_crypt'}]
                ]
            })
        }
}
