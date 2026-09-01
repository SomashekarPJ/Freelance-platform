# Freelance Bidding Platform (Mini Fiverr Clone)

Minimal MERN-stack freelance marketplace MVP.

Quickstart

1. Backend

- cd server
- npm install
- create a `.env` file with `MONGO_URI`, `JWT_SECRET`, and optionally `STRIPE_KEY`
- npm run dev

2. Frontend

- cd client
- npm install
- npm start

Features

- User roles: client / freelancer
- Post projects, place bids
- Accept bid -> contract
- Basic messaging
- Stripe test key supported for mock payments (optional)

Smoke test

1. Start the server (default port 5000):

```bash
cd server
npm install
npm run dev
```

2. In another terminal, run the smoke test (requires `jq`):

```bash
cd server
chmod +x smoke_test.sh
./smoke_test.sh
```

The script will register sample users, post a job, place a bid, and attempt to accept it.
 
Stripe setup

- Set `STRIPE_KEY` in `server/.env` to your Stripe secret key (test key like `sk_test_...`).
- To verify webhooks, set `STRIPE_WEBHOOK_SECRET` in `server/.env` and run the server with the raw body capture enabled (already configured).

Example `.env`:

```
MONGO_URI=mongodb://<username>:<password>@ac-ysbyuuq-shard-00-00.3nic5bo.mongodb.net:27017,ac-ysbyuuq-shard-00-01.3nic5bo.mongodb.net:27017,ac-ysbyuuq-shard-00-02.3nic5bo.mongodb.net:27017/freelance-platform?replicaSet=atlas-6n3tcd-shard-0&authSource=admin&ssl=true
JWT_SECRET=your_jwt_secret
STRIPE_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Troubleshooting the Atlas connection

This project connects to MongoDB Atlas using a **non-SRV** `mongodb://` connection string (listing the Atlas shard hosts explicitly) rather than the `mongodb+srv://` URI Atlus gives you by default. Two problems were fixed:

- **Wrong target** — the bundled `.env` / VS Code preset pointed at a local `mongodb://localhost`, which isn't running. They now point at your Atlas cluster.
- **A Node DNS quirk on this machine** — `node -e "console.log(require('dns').getServers())"` prints `["127.0.0.1"]`, so Node's c-ares resolver cannot resolve `mongodb+srv://` SRV/TXT records (`querySrv ECONNREFUSED`). `nslookup`/`Resolve-DnsName` and the OS resolver work fine, and TCP to Atlas port 27017 is reachable — only `mongodb+srv://` is blocked.

The non-SRV string works because `mongoose`/`net.connect` resolve the shard hostnames via the OS resolver (`dns.lookup`) instead of c-ares SRV. If you fix the DNS (delete the stale blank `NameServer` key at `HKLM/SYSTEM/CurrentControlSet/Services/Tcpip/Parameters/NameServer` as Administrator, or set your adapter DNS to `10.88.154.118`), you can switch back to the standard `mongodb+srv://` URI.

> ⚠️ Never commit real credentials. The real connection string lives only in the gitignored `server/.env`; `.env.example` and `README.md` use placeholders.

Note: when a client accepts a bid the server will create a `Contract` and a Stripe PaymentIntent; the API will return a `clientSecret` which the client can use with Stripe Elements to complete payment. The webhook will mark the contract as paid when the PaymentIntent succeeds.
