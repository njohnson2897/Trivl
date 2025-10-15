import sequelize from "./config/connection.js";

try {
  await sequelize.authenticate();
  console.log("Database connected");

  const [results] = await sequelize.query(`
    SELECT 
      tc.constraint_name, 
      kcu.column_name, 
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name='user_friends';
  `);

  console.log("Foreign key constraints:");
  results.forEach((row) => {
    console.log(
      `${row.constraint_name}: ${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`
    );
  });

  process.exit(0);
} catch (error) {
  console.error("Error:", error);
  process.exit(1);
}
