import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the data from the request body
    const data = req.body;
    
    // Path to db.json in the public folder
    const dbPath = path.join(process.cwd(), 'public', 'db.json');
    
    // Write the data to the file
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    
    return res.status(200).json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
