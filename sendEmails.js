const fs = require("fs");
const pdf = require("pdf-parse");
const nodemailer = require("nodemailer");

// 1. Extract HR Name + Email from PDF
async function extractContactsFromPDF(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  const text = data.text;

  const contactRegex = /([A-Za-z\s.]+)\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,})/g;

  let contacts = [];
  let match;
  while ((match = contactRegex.exec(text)) !== null) {
    let name = match[1].trim();
    let email = match[2].trim();
    contacts.push({ name, email });
  }

  const uniqueContacts = Array.from(
    new Map(contacts.map((c) => [c.email, c])).values()
  );

  return uniqueContacts;
}

// 2. Setup Nodemailer transporter
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "barathbalag@gmail.com",   // 🔹 Replace with your Gmail
    pass: "dgwhpjmketcqzgev",        // 🔹 Gmail App Password
  },
});

// 3. Base message
const baseMessage = `
I am Balaji S, a final-year B.Tech IT student at University College of Engineering Nagercoil (Anna University), passionate about software development and eager to contribute my skills to your organization. I have successfully completed a real-time project in collaboration with the Kanyakumari Police Department (July 2025), which strengthened my technical expertise and problem-solving skills.

Please find my resume attached for your consideration.

You can also view my work here:

LinkedIn: https://www.linkedin.com/in/balaji9840
Portfolio: https://portbalaji.netlify.app/
GitHub: https://github.com/bala9840

I would be grateful for the opportunity to discuss how I can add value to your team.

Thank you for your time and consideration.

Best regards,
Balaji S
7695883050
`;

// 4. Send email function
async function sendEmail(name, email) {
  let personalizedMessage = `Dear ${name},\n\n${baseMessage}`;

  let mailOptions = {
    from: "your_email@gmail.com",
    to: email,
    subject: "Application for Job Opportunity – Final Year B.Tech IT",
    text: personalizedMessage,
    attachments: [
      {
        filename: "balaji_resume.pdf",
        path: "./balaji_resume.pdf",
      },
    ],
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log(`✅ Sent to ${name} (${email})`);
  } catch (error) {
    console.error(`❌ Failed to send to ${name} (${email}):`, error.message);
  }
}

// 5. Batch sending with "fromBatch" and "toBatch"
async function sendEmailsInBatches(batchSize = 20, delayMs = 30000, fromBatch = 1, toBatch = Infinity) {
  const contacts = await extractContactsFromPDF("./CompanyWise_HR_contact.pdf");
  console.log(`📌 Found ${contacts.length} HR contacts.`);

  let totalBatches = Math.ceil(contacts.length / batchSize);

  for (let batchIndex = fromBatch; batchIndex <= toBatch && batchIndex <= totalBatches; batchIndex++) {
    const start = (batchIndex - 1) * batchSize;
    const end = start + batchSize;
    const batch = contacts.slice(start, end);

    console.log(`🚀 Sending batch ${batchIndex} (${batch.length} emails)...`);

    for (const { name, email } of batch) {
      await sendEmail(name, email);
    }

    if (batchIndex < toBatch && batchIndex < totalBatches) {
      console.log(`⏳ Waiting ${delayMs / 1000} seconds before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.log("🎉 Selected batch range processed!");
}


sendEmailsInBatches(20, 30000, 1, 2);
// sendEmailsInBatches(batchSize, delayMs, fromBatch, toBatch);
