from binance import Client
import os

# Manual .env loading if dotenv is missing
env_path = '.env'
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env') # From scripts/ to root

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value.strip('"').strip("'")

api_key = os.getenv('BINANCE_API_KEY')
api_secret = os.getenv('BINANCE_API_SECRET') or os.getenv('BINANCE_SECRET_KEY')

client = Client(api_key, api_secret)

# Get market depth
depth = client.get_order_book(symbol='BTCUSDT')
print(f"Bids: {depth['bids'][:3]}")

# Get account information
account = client.get_account()
print(f"Account balances: {[b for b in account['balances'] if float(b['free']) > 0]}")

# Get asset balance
balance = client.get_asset_balance(asset='BTC')
print(f"BTC Balance: {balance}")
