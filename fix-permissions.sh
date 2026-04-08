#!/bin/bash
# Скрипт для исправления прав доступа к админке
# Запускать на сервере: bash fix-permissions.sh

cd /root/Five_Fasad

# Создаём backup директорию если её нет
mkdir -p frontend/backup

# Определяем UID/GID PHP-FPM пользователя (обычно 82 в Alpine)
PHP_UID=$(docker exec fivefasad-php id -u www-data 2>/dev/null || echo "82")
PHP_GID=$(docker exec fivefasad-php id -g www-data 2>/dev/null || echo "82")

echo "PHP-FPM работает от пользователя UID:$PHP_UID GID:$PHP_GID"

# Устанавливаем права
chown -R $PHP_UID:$PHP_GID frontend/admin
chown -R $PHP_UID:$PHP_GID frontend/backup 2>/dev/null || true

chmod -R 755 frontend/admin
chmod 664 frontend/admin/conf.ini 2>/dev/null || true
chmod -R 775 frontend/backup 2>/dev/null || true

# Также даём права на запись в корень для редактирования файлов
# (осторожно - это даст права на запись во все файлы frontend)
chmod -R 775 frontend 2>/dev/null || chmod -R 755 frontend

echo "Права установлены. Проверь админку."



