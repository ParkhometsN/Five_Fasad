const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Telegraf, Markup } = require('telegraf');
const nodemailer = require('nodemailer');

const app = express();


// Middleware для парсинга данных формы
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка SMTP для отправки писем
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'mofmails@gmail.com',
        pass: 'tsdzbhmemjyfjlkh'
    }
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Добавьте в начало файла после require
const cors = require('cors');
app.use(cors());

const bot = new Telegraf('8500810444:AAHISPjpFdG-TIxWS9jcQXObKGJnbTDfxL4');
const MANAGER_CHAT_ID = '866843496';

const messageMap = new Map();
const clientSockets = new Map();

// Храним состояние менеджеров (кто нажал Start)
const managerStates = new Map();

// Статистика
let dailyStats = {
    date: new Date().toDateString(),
    clientCounter: 0,
    totalClients: 0,
    clientsWithMessages: new Set(),
    allConnectedClients: new Set()
};

let lastTypingSent = 0;
let isChatSystemWorking = true;

// Сброс статистики в 22:00 каждый день
function resetDailyStats() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(22, 0, 0, 0);
    
    const timeUntilReset = tomorrow - now;
    
    setTimeout(() => {
        dailyStats = {
            date: new Date().toDateString(),
            clientCounter: 0,
            totalClients: 0,
            clientsWithMessages: new Set(),
            allConnectedClients: new Set()
        };
        console.log('Статистика сброшена на новый день');
        resetDailyStats();
    }, timeUntilReset);
}

resetDailyStats();

// Генерация имени клиента
function generateClientName() {
    dailyStats.clientCounter++;
    return `Клиент ${dailyStats.clientCounter}`;
}

// Получить статистику за сегодня
function getTodayStats() {
    if (!dailyStats.allConnectedClients) dailyStats.allConnectedClients = new Set();
    if (!dailyStats.clientsWithMessages) dailyStats.clientsWithMessages = new Set();
    
    return {
        date: dailyStats.date || new Date().toDateString(),
        totalConnected: dailyStats.allConnectedClients.size,
        totalWithMessages: dailyStats.clientsWithMessages.size,
        clientCounter: dailyStats.clientCounter || 0
    };
}

// Основная клавиатура для менеджера
function getMainKeyboard() {
    return Markup.keyboard([
        ['📊 Статистика за сегодня', '🟢 Статус системы'],
        ['🔴 Включить техработы', '🟢 Выключить техработы']
    ])
    .resize()
    .oneTime(false);
}

// Клавиатура только с кнопкой Start
function getStartKeyboard() {
    return Markup.keyboard([
        ['🚀 Start']
    ])
    .resize()
    .oneTime(false);
}

// Уведомление всех клиентов о технических работах
function broadcastSystemMessage(message) {
    clientSockets.forEach((socket, clientId) => {
        try {
            socket.emit('system_message', message);
        } catch (error) {
            console.error('Ошибка отправки системного сообщения клиенту:', clientId, error.message);
        }
    });
}

// Обновить приветственное сообщение для всех клиентов
function updateWelcomeMessageForAllClients() {
    const welcomeMessage = isChatSystemWorking 
        ? 'Здравствуйте! Чем могу помочь?' 
        : '⚠️ Идут технические работы, попробуйте чуть позже';
    
    clientSockets.forEach((socket, clientId) => {
        try {
            socket.emit('update_welcome_message', welcomeMessage);
        } catch (error) {
            console.error('Ошибка обновления приветственного сообщения:', clientId, error.message);
        }
    });
}

// API для отправки формы
app.post('/api/send-form', async (req, res) => {
    console.log('📝 Получена форма:', req.body);
    
    try {
        const { name, position, phone, email, message } = req.body;
        
        // Валидация
        if (!name || !position || !phone || !email) {
            return res.json({
                success: false,
                message: 'Пожалуйста, заполните все обязательные поля'
            });
        }
        
        // Формируем письмо
        const mailOptions = {
            from: 'mofmails@gmail.com',
            to: 'parkhometsnikita@gmail.com',
            subject: 'Новая заявка с сайта Five Fasad',
            html: `
                <h2>Новая заявка с сайта</h2>
                <table border="1" cellpadding="5">
                    <tr><td><strong>Имя:</strong></td><td>${name}</td></tr>
                    <tr><td><strong>Должность:</strong></td><td>${position}</td></tr>
                    <tr><td><strong>Телефон:</strong></td><td>${phone}</td></tr>
                    <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
                    ${message ? `<tr><td><strong>Сообщение:</strong></td><td>${message}</td></tr>` : ''}
                </table>
            `
        };
        
        await transporter.sendMail(mailOptions);
        
        res.json({
            success: true,
            message: 'Заявка успешно отправлена! Мы свяжемся с вами.'
        });
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        res.json({
            success: false,
            message: 'Ошибка отправки. Попробуйте позже.'
        });
    }
});

// WebSocket логика
io.on('connection', (socket) => {
    let clientId = null;
    let clientName = null;

    socket.on('identify', (id) => {
        clientId = id;
        socket.clientId = clientId;
        
        clientName = generateClientName();
        clientSockets.set(clientId, socket);
        
        if (!dailyStats.allConnectedClients) dailyStats.allConnectedClients = new Set();
        dailyStats.allConnectedClients.add(clientId);
        dailyStats.totalClients++;
        
        console.log(`Новый клиент подключился: ${clientName}`);
        
        // Отправляем только ОДНО приветственное сообщение при подключении
        const welcomeMessage = isChatSystemWorking 
            ? 'Здравствуйте! Чем могу помочь?' 
            : '⚠️ Идут технические работы, попробуйте чуть позже';
        
        socket.emit('manager_message', welcomeMessage);
    });

    socket.on('send_message', (msg) => {
        if (!clientId) return;

        if (!checkSystemHealth()) {
            socket.emit('system_message', '⚠️ Идут технические работы, попробуйте чуть позже');
            return;
        }

        const clientIndex = Array.from(dailyStats.allConnectedClients || new Set()).indexOf(clientId) + 1;
        const clientName = `Клиент ${clientIndex}`;
        const text = `💬 Новое сообщение от ${clientName}:\n\n${msg}`;
        
        if (!dailyStats.clientsWithMessages) dailyStats.clientsWithMessages = new Set();
        dailyStats.clientsWithMessages.add(clientId);
        
        // Отправляем сообщение только менеджерам, которые начали работу
        managerStates.forEach((isActive, managerChatId) => {
            if (isActive) {
                bot.telegram.sendMessage(managerChatId, text)
                    .then((sent) => {
                        messageMap.set(sent.message_id, { clientId, messageText: msg });
                        console.log(`Сообщение от ${clientName} отправлено менеджеру ${managerChatId}`);
                    })
                    .catch(err => {
                        console.error('Ошибка отправки менеджеру:', managerChatId, err.message);
                    });
            }
        });
        
        // Если нет активных менеджеров, отправляем системное сообщение клиенту
        let hasActiveManagers = false;
        managerStates.forEach(isActive => {
            if (isActive) hasActiveManagers = true;
        });
        
        if (!hasActiveManagers && isChatSystemWorking) {
            socket.emit('manager_message', 'В данный момент менеджер недоступен. Оставьте сообщение, и мы ответим вам в ближайшее время.');
        }
    });

    socket.on('typing', (isTyping) => {
        if (!isTyping || !checkSystemHealth()) return;

        const now = Date.now();
        if (now - lastTypingSent > 6000) {
            // Отправляем действие typing только активным менеджерам
            managerStates.forEach((isActive, managerChatId) => {
                if (isActive) {
                    bot.telegram.sendChatAction(managerChatId, 'typing').catch(() => {});
                }
            });
            lastTypingSent = now;
        }
    });

    socket.on('disconnect', () => {
        if (clientId) {
            console.log(`Клиент отключился: ${clientName}`);
            clientSockets.delete(clientId);
        }
    });
});

// Обработка команды /start
bot.start((ctx) => {
    const chatId = ctx.chat.id;
    
    // Отправляем кнопку Start
    ctx.reply('Добро пожаловать! Нажмите кнопку Start для начала работы с ботом.', {
        reply_markup: getStartKeyboard().reply_markup
    });
});

// Обработка нажатия на кнопку Start
bot.hears('🚀 Start', (ctx) => {
    const chatId = ctx.chat.id;
    
    // Устанавливаем менеджера как активного
    managerStates.set(chatId, true);
    
    // Отправляем приветственное сообщение
    ctx.reply('Здравствуйте! Бот готов к работе. Используйте кнопки ниже для управления чатом.', {
        reply_markup: getMainKeyboard().reply_markup
    });
    
    console.log(`Менеджер ${chatId} начал работу`);
});

// Обработка остальных кнопок
bot.on('text', (ctx) => {
    const text = ctx.message.text;
    const chatId = ctx.chat.id;
    
    // Проверяем, начал ли менеджер работу
    if (!managerStates.get(chatId)) {
        // Если менеджер не начал работу, предлагаем нажать Start
        ctx.reply('Пожалуйста, нажмите кнопку Start для начала работы.', {
            reply_markup: getStartKeyboard().reply_markup
        });
        return;
    }
    
    // Обработка команд для активных менеджеров
    if (text === '📊 Статистика за сегодня') {
        const stats = getTodayStats();
        ctx.reply(`📊 Статистика за сегодня (${stats.date}):

💬 Написали сообщения: ${stats.totalWithMessages}
🔢 Счетчик клиентов/посещений сайта: ${stats.clientCounter}`, {
            reply_markup: getMainKeyboard().reply_markup
        });
        return;
    }
    
    if (text === '🟢 Статус системы') {
        const status = isChatSystemWorking ? '🟢 РАБОТАЕТ' : '🔴 НЕ РАБОТАЕТ';
        const clientsCount = clientSockets.size;
        ctx.reply(`Статус системы: ${status}\nАктивных подключений: ${clientsCount}`, {
            reply_markup: getMainKeyboard().reply_markup
        });
        return;
    }
    
    if (text === '🔴 Включить техработы') {
        isChatSystemWorking = false;
        
        // Обновляем приветственное сообщение для всех подключенных клиентов
        updateWelcomeMessageForAllClients();
        
        ctx.reply('🔴 Режим технических работ ВКЛЮЧЕН. Все клиенты уведомлены.', {
            reply_markup: getMainKeyboard().reply_markup
        });
        return;
    }
    
    if (text === '🟢 Выключить техработы') {
        isChatSystemWorking = true;
        
        // Обновляем приветственное сообщение для всех подключенных клиентов
        updateWelcomeMessageForAllClients();
        
        ctx.reply('🟢 Режим технических работ ВЫКЛЮЧЕН. Чат работает в обычном режиме.', {
            reply_markup: getMainKeyboard().reply_markup
        });
        return;
    }

    // Обработка ответов на сообщения клиентов
    if (ctx.message?.reply_to_message) {
        const originalId = ctx.message.reply_to_message.message_id;
        const messageData = messageMap.get(originalId);

        if (messageData && clientSockets.has(messageData.clientId)) {
            const socket = clientSockets.get(messageData.clientId);
            const replyText = ctx.message.text || '[Медиа/файл]';
            
            socket.emit('manager_message', replyText);
            console.log(`Ответ отправлен клиенту: ${messageData.clientId}`);
            ctx.reply('✅ Ответ отправлен клиенту', {
                reply_markup: getMainKeyboard().reply_markup
            });
        } else {
            ctx.reply('❌ Клиент отключился или не найден', {
                reply_markup: getMainKeyboard().reply_markup
            });
        }
    }
});

function checkSystemHealth() {
    return isChatSystemWorking;
}

// Автоматическая отправка статистики в 22:00 только активным менеджерам
function scheduleDailyStats() {
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(22, 0, 0, 0);
    
    if (now > targetTime) {
        targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const timeUntilStats = targetTime - now;
    
    setTimeout(() => {
        managerStates.forEach((isActive, managerChatId) => {
            if (isActive) {
                const stats = getTodayStats();
                const message = `📊 Статистика за сегодня (${stats.date}):

💬 Написали сообщения: ${stats.totalWithMessages}`;

                bot.telegram.sendMessage(managerChatId, message, {
                    reply_markup: getMainKeyboard().reply_markup
                });
            }
        });
        scheduleDailyStats();
    }, timeUntilStats);
}

scheduleDailyStats();

// Обработка ошибок бота
bot.catch((err, ctx) => {
    console.error(`Ошибка бота для ${ctx.updateType}:`, err);
});

// При запуске отправляем кнопку Start менеджеру
bot.launch().then(() => {
    console.log('Бот Telegram успешно запущен');
    
    // Отправляем стартовое сообщение с кнопкой Start
    bot.telegram.sendMessage(MANAGER_CHAT_ID, 'Добро пожаловать! Нажмите кнопку Start для начала работы с ботом.', {
        reply_markup: getStartKeyboard().reply_markup
    });
}).catch(err => {
    console.error('Ошибка запуска бота:', err);
});

server.listen(3002, () => {
    console.log('Сервер чата работает на порту 3002');
});

process.on('SIGTERM', async () => {
    console.log('Получен SIGTERM, завершаем работу...');
    await bot.stop();
    server.close();
    process.exit(0);
});