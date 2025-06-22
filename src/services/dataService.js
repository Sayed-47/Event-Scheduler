import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DataService {
    constructor() {
        this.dataDir = path.join(__dirname, '../../data');
        this.eventsFile = path.join(this.dataDir, 'events.json');
        this.backupDir = path.join(this.dataDir, 'backups');
        // Remove immediate init() call to prevent async constructor issues
    }

    async init() {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
            await fs.mkdir(this.backupDir, { recursive: true });

            try {
                await fs.access(this.eventsFile);
                console.log('📁 Events file exists');
            } catch {
                console.log('📁 Creating initial events file...');
                await this.createInitialData();
            }
        } catch (error) {
            console.error('Error initializing data service:', error);
        }
    }

    async createInitialData() {
        const initialData = {
            timestamp: new Date().toISOString(),
            version: "1.0",
            totalEvents: 6,
            events: [
                {
                    id: 1,
                    title: "International University Programming Contest (IUPC)",
                    date: "2025-07-15T10:00:00.000Z",
                    location: "NSU Auditorium",
                    description: "Annual programming contest for university students featuring algorithmic challenges",
                    source: "Facebook",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    title: "Tech Summit 2025: Future of AI",
                    date: "2025-07-01T09:00:00.000Z",
                    location: "BUET Campus",
                    description: "Technology summit featuring industry leaders discussing the future of artificial intelligence",
                    source: "Website",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    title: "AI/ML Seminar: Deep Learning Advances",
                    date: "2025-06-28T14:00:00.000Z",
                    location: "DIU Auditorium",
                    description: "Comprehensive seminar on Artificial Intelligence and Machine Learning recent advances",
                    source: "Email",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 4,
                    title: "Full Stack Development Bootcamp",
                    date: "2025-06-25T10:00:00.000Z",
                    location: "Online Platform",
                    description: "Intensive coding bootcamp covering modern web development technologies",
                    source: "Facebook",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 5,
                    title: "Blockchain & Cryptocurrency Workshop",
                    date: "2025-07-20T15:30:00.000Z",
                    location: "Dhaka University",
                    description: "Hands-on workshop exploring blockchain technology and cryptocurrency development",
                    source: "Website",
                    createdAt: new Date().toISOString()
                },
                {
                    id: 6,
                    title: "Cybersecurity Conference 2025",
                    date: "2025-08-05T11:00:00.000Z",
                    location: "Sheraton Hotel",
                    description: "Annual cybersecurity conference featuring threat analysis and protection strategies",
                    source: "Email",
                    createdAt: new Date().toISOString()
                }
            ]
        };

        await fs.writeFile(this.eventsFile, JSON.stringify(initialData, null, 2));
        console.log('📁 Initial events data created');
    }

    async loadEvents() {
        try {
            // Initialize if not done already
            await this.init();
            
            const data = await fs.readFile(this.eventsFile, 'utf8');
            const parsed = JSON.parse(data);
            
            parsed.events = parsed.events.map(event => ({
                ...event,
                date: new Date(event.date),
                createdAt: new Date(event.createdAt)
            }));

            return parsed;
        } catch (error) {
            console.error('Error loading events:', error);
            throw new Error('Failed to load events');
        }
    }

    async saveEvents(eventsData) {
        try {
            // Ensure initialization
            await this.init();
            
            // Create backup first if file exists
            try {
                await fs.access(this.eventsFile);
                await this.createBackup();
            } catch {
                // File doesn't exist yet, no backup needed
            }

            const dataToSave = {
                ...eventsData,
                timestamp: new Date().toISOString(),
                events: eventsData.events.map(event => ({
                    ...event,
                    date: event.date.toISOString(),
                    createdAt: event.createdAt.toISOString()
                }))
            };

            await fs.writeFile(this.eventsFile, JSON.stringify(dataToSave, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving events:', error);
            throw new Error('Failed to save events');
        }
    }

    async createBackup() {
        try {
            const data = await fs.readFile(this.eventsFile, 'utf8');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(this.backupDir, `events_backup_${timestamp}.json`);
            await fs.writeFile(backupFile, data);
            console.log(`📄 Backup created: ${backupFile}`);
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }

    async getBackups() {
        try {
            await this.init();
            const files = await fs.readdir(this.backupDir);
            return files.filter(file => file.endsWith('.json'));
        } catch (error) {
            console.error('Error getting backups:', error);
            return [];
        }
    }
}

export default new DataService();