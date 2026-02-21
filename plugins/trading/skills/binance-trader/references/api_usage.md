# Binance API Guide (python-binance)

This guide covers common tasks when using the `python-binance` library.

## Setup

Install the library:
```bash
pip install python-binance python-dotenv
```

## Credentials

Create a `.env` file based on `assets/.env.example`:
```bash
cp skills/binance-trader/assets/.env.example .env
```
Edit `.env` and add your Binance API keys (required variables: `BINANCE_API_KEY` and `BINANCE_API_SECRET` — the scripts also support `BINANCE_SECRET_KEY`).

If `.env` is missing, the scripts will try to find it in the script directory, the `test/` folder, and then the project root; if you prefer, place `.env` at the project root for consistency.

## Client Initialization

```python
from binance import Client
client = Client(api_key, api_secret)
# For Testnet
# client = Client(api_key, api_secret, testnet=True)
```

## Common REST API Methods

| Method | Description |
|--------|-------------|
| `get_account()` | Fetch account information and balances |
| `get_asset_balance(asset='BTC')` | Get balance for a specific asset |
| `get_symbol_ticker(symbol='BTCUSDT')` | Get latest price |
| `get_order_book(symbol='BTCUSDT')` | Get order book depth |
| `get_historical_klines(symbol, interval, start_str, end_str=None)` | Get historical OHLCV data |

## Order Types

### Market Order
```python
client.create_order(symbol='BTCUSDT', side='BUY', type='MARKET', quantity=0.001)
```

### Limit Order
```python
client.create_order(symbol='BTCUSDT', side='SELL', type='LIMIT', timeInForce='GTC', quantity=0.001, price='70000')
```

### OCO Order
```python
client.create_oco_order(symbol='BTCUSDT', side='SELL', quantity=0.001, price='75000', stopPrice='60000', stopLimitPrice='59900', stopLimitTimeInForce='GTC')
```

## WebSockets (Async)

Use `BinanceSocketManager` for real-time data.

```python
from binance import AsyncClient, BinanceSocketManager
# See scripts/async_sockets.py for example
```
