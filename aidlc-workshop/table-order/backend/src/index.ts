import app from './app';
import { initializeDatabase } from './database/init';

const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

app.listen(PORT, () => {
  console.log(`Table Order API server running on port ${PORT}`);
});
