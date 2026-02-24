import asyncio
from binance import AsyncClient, BinanceSocketManager
import os

# Manual .env loading if dotenv is missing
if os.path.exists('.env'):
    with open('.env', 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value

async def main():
    client = await AsyncClient.create(
        api_key=os.getenv('BINANCE_API_KEY'),
        api_secret=os.getenv('BINANCE_API_SECRET') or os.getenv('BINANCE_SECRET_KEY')
    )
    bsm = BinanceSocketManager(client)
    
    # K-line socket
    async with bsm.kline_socket(symbol='BTCUSDT') as stream:
        for _ in range(5):
            res = await stream.recv()
            print(f"BTCUSDT K-line: {res['k']['c']}") # Current close price

    await client.close_connection()

if __name__ == "__main__":
    asyncio.run(main())
