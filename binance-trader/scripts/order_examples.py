from binance import Client
import os

# Manual .env loading if dotenv is missing
env_path = '.env'
if not os.path.exists(env_path):
    env_path = os.path.join(os.path.dirname(__file__), '..', '..', '.env')

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value.strip('"').strip("'")

api_key = os.getenv('BINANCE_API_KEY')
api_secret = os.getenv('BINANCE_API_SECRET') or os.getenv('BINANCE_SECRET_KEY')

client = Client(api_key, api_secret)

# 1. Market Buy Order
# order = client.create_order(
#     symbol='BNBBTC',
#     side=Client.SIDE_BUY,
#     type=Client.ORDER_TYPE_MARKET,
#     quantity=100)

# 2. Limit Sell Order
# order = client.create_order(
#     symbol='BNBBTC',
#     side=Client.SIDE_SELL,
#     type=Client.ORDER_TYPE_LIMIT,
#     timeInForce=Client.TIME_IN_FORCE_GTC,
#     quantity=100,
#     price='0.0001')

# 3. OCO (One-Cancels-the-Other) Order
# OCO orders are useful for setting both a take-profit and a stop-loss
# order = client.create_oco_order(
#     symbol='BTCUSDT',
#     side=Client.SIDE_SELL,
#     stopLimitTimeInForce=Client.TIME_IN_FORCE_GTC,
#     quantity=0.001,
#     stopPrice='60000',
#     stopLimitPrice='59900',
#     price='75000')

print("Example script for order types. Uncomment code blocks to use.")
