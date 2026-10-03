import { app } from './app.js';
import { seedIfEmpty } from './seed.js';

seedIfEmpty();

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`Support Ticket API running on http://localhost:${port}`);
});