set -e

echo "install"
npm ci

echo "prisma"
npx prisma generate
npx prisma migrate deploy

echo "build"
npm run build

echo "pm2 restart"
pm2 start infra/ec2/ecosystem.config.js --update-env

echo "save"
pm2 save

pm2 list
echo "done"
