const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// 1. Setup the connection pool using your Supabase URL
const connectionString = "postgresql://postgres:Terraide6583!@db.ppufwyjllaluzugpjzqq.supabase.co:5432/postgres";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Instantiate the Prisma Client with the adapter
const prisma = new PrismaClient({ adapter });

app.use(cors());
app.use(express.json());

// --- ROUTES ---

// 1. GET: Fetch contacts sorted by next reminder (Urgency)
app.get('/contacts', async (req, res) => {
    try {
        const allContacts = await prisma.contact.findMany({
            orderBy: { nextReminder: 'asc' }
        });
        res.json(allContacts); 
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Database connection failed", details: error.message });
    }
});

// 2. POST: Create a brand new contact
app.post('/contacts', async (req, res) => {
    const { name, category } = req.body;
    
    // Logic: Calculate reminder days based on category
    let daysToAdd = 30; 
    if (category === 'Family') daysToAdd = 7;
    if (category === 'Acquaintance') daysToAdd = 90;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);

    try {
        const newPerson = await prisma.contact.create({
            data: { 
                name, 
                category: category || "Friend", 
                status: `Reach out every ${daysToAdd} days`,
                nextReminder: nextDate 
            }
        });
        res.status(201).json(newPerson);
    } catch (error) {
        console.error("Create Error:", error);
        res.status(500).json({ error: "Failed to save to database" });
    }
});

// 3. POST: Mark someone as contacted (Resets the timer)
app.post('/contacts/:id/contacted', async (req, res) => {
    const { id } = req.params;

    try {
        const contact = await prisma.contact.findUnique({ where: { id: parseInt(id) } });
        if (!contact) return res.status(404).json({ error: "User not found" });

        let daysToAdd = 30;
        if (contact.category === 'Family') daysToAdd = 7;
        if (contact.category === 'Acquaintance') daysToAdd = 90;

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysToAdd);

        const updated = await prisma.contact.update({
            where: { id: parseInt(id) },
            data: { 
                lastContacted: new Date(),
                nextReminder: nextDate,
                status: `Reach out again in ${daysToAdd} days`
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ error: "Failed to update" });
    }
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Prisma 7 Engine Active`);
});