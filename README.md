# [🔥 UPDATE V1] Trading212Driver

Aplicación que permite interactuar con la web de Trading212

## 💡 Cómo utilizar la aplicación

```
    1. Renombrar **.env.example** a **.env** `mv .env.example .env`
    2. Modificar las variables de **.env**
    3. Instalar las dependencias `npm i`
    4. Lanzar la aplicación `npm run start` (para desarrollo utilizar `npm run dev`)
```

## 🛒 Peticiones de ejemplo

### Compra

Comprará Stocks de Amazon por el valor de la propiedad AMOUNT_PER_TRANSACTION del .env

```
curl --location --request POST 'https://localhost/api/v0/trading212' \
--header 'Content-Type: application/json' \
--data-raw '{
  "order": "BUY",
  "asset": "(AMZN)",
  "token": "6116714f-fe3e-43be-a194-f453fbf51c71",
}'
```

### Venta

Venderá todo el stock de acciones de Amazon que tiene disponible en la cuenta

```
curl --location --request POST 'https://localhost/api/v0/trading212' \
--header 'Content-Type: application/json' \
--data-raw '{
  "order": "SELL",
  "asset": "(AMZN)",
  "token": "6116714f-fe3e-43be-a194-f453fbf51c71"
}'
```

## 🚀 Desplegar en heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/xBidi/Trading212Driver)

### ⚠️ Beware of forks. I do not give any guarantee that the fork may turn out to be a scam.

### 💥 Disclaimer

All investment strategies and investments involve risk of loss.
**Nothing contained in this program, scripts, code or repository should be construed as investment advice.**
Any reference to an investment's past or potential performance is not, and should not be construed as, a recommendation
or as a guarantee of any specific outcome or profit. By using this program you accept all liabilities, and that no
claims can be made against the developers or others connected with the program.

