# Second Shift

A business laptop partner portal for **Free Geek Toronto**, built for the FUSE Society Blueprint 2026 case competition.

Small and medium businesses pledge batches of retired work laptops, see instantly whether Free Geek Toronto can refurbish them, and book a drop-off or pickup. Staff track each batch on a depot board, record serial numbers and the wipe method, and the business gets a printable data-sanitisation certificate.

## Run it

```bash
npm install
cp .env.example .env.local   # then set STAFF_PASSWORD
npm run dev
```

- `/donate`: pledge form with a live fit check
- `/pledge/[id]`: the business's private "shift ticket" tracker
- `/pledge/[id]/certificate`: data-wipe certificate (once wiped)
- `/staff`: depot board (staff password)
- `/impact/[shareId]`: public impact page with a LinkedIn card
- `/partners`: partner wall (opt-in names, tiers)
- `/check`: household "Can I donate this?" checker

```bash
npm test
```

## Notes

- Fit scores and impact numbers use stated planning assumptions (`src/lib/fit.ts`), not Free Geek Toronto data.
- Pledges are stored in MongoDB when `MONGODB_URI` is set (database `MONGODB_DB`, default `second_shift`), otherwise in `.data/pledges.json`.
- Prototype only: not an official Free Geek Toronto service.

MIT licence.
