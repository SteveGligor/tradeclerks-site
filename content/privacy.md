# Trade Clerks Privacy Policy

**Not legal advice. Have a lawyer check it before launch.** At launch, update the date (and bump the version if the wording changes).

<!-- Set the effective date to the day this version is published on the website. -->
*Effective November 2, 2026. Version 1.5.*

Trade Clerks is an app that turns what you say about a job into an invoice, and keeps track of your jobs, customers and the equipment you install. This policy explains what we store, why, who helps us run the app, and how to delete it.

"We" means Steve Gligor, operating as Trade Clerks, Burlington, Ontario, Canada. "You" means the tradesperson using the app.

## The short version

- We store what you put in the app so it can do its job: your business details, your customers, your invoices and jobs.
- We never sell your data or your customers' data.
- Voice recordings are turned into text. The audio stays on your phone only until it's sent (or you cancel), and we don't store it on our servers. Recordings aren't used to train AI models.
- We only keep the text of your recordings (transcripts) if you turn that on, and you can delete them any time.
- When you start a job from a customer's text, the screenshots or text you choose are read by AI and not kept.
- If you have a Trade Clerks business number, the texts between you and your customers on it are stored in your account, like your customers and jobs. Twilio carries them.
- Deleting your account deletes everything in it.

## What we store

**Your account and business**
- Email address and password (the password is stored encrypted; we can't see it).
- Business details you enter: business name, trade, country and province or state, tax and licence numbers, phone, email, address, and logo.
- Your account or dealer numbers with manufacturers, if you add them, so registrations are quicker to fill in.
- The date you agreed to these terms and which version.
- How you heard about Trade Clerks, if you tell us when you sign up (for example, the name of the person who referred you).

**Your customers**
- Names, email addresses and phone numbers you enter or say in a recording.
- Service addresses (where you did the work).

**Your work**
- Invoices: line items, prices, tax, totals, dates, the job description, and whether they were sent or paid, and how they were paid.
- Private notes on an invoice. These are for you only: they are never printed on the invoice or emailed to your customer.
- Jobs: what was done, when, for whom and where.
- Equipment you record on a job, such as brand, model, serial number, and install and manufacture dates.
- Photos you add to a job, such as a unit's rating plate. Before a photo is uploaded we remove its location and other hidden details, and it's stored privately: only you can see it.
- When you add a rating plate photo, it's sent to our AI provider to read the brand, model, serial number and other printed details. You check each one before anything is saved, and only what you save is kept.
- **Jobs from a text.** When you start a job from a customer's text, the screenshots you choose (or the text you paste) are sent to our AI provider to read your customer's name, phone number, email, the service address and what they need. Before a screenshot is sent, the app makes a new copy without its location and other hidden details. The screenshots and text aren't saved, on our servers or anywhere else: they're read once and discarded. You check each detail before anything is saved, and only what you save is kept, as an ordinary customer and job. A screenshot can also show your own messages and anyone else in the conversation, so only choose conversations with your customers.
- Coming soon: warranty registrations and rebate or incentive claims you track in the app, and their status.
- If you register a customer's equipment for them, you do it yourself on the manufacturer's website; the app shows you the details to copy. Your invoice tells your customer that their new equipment will be registered for warranty with the manufacturer. We never send your customers' information to a manufacturer ourselves.

**Your business number** (on plans that include it)
- Your Trade Clerks phone number, and the cell number you verify so we can reach you on it.
- Texts on that number: what your customers send you and what you send them (the intake message asking for their details, and your replies), with each customer's phone number, the time, and whether a text was delivered.
- Whether a customer has replied STOP. When they do, the app won't text them again until they reply START.
- Texts are not read by AI unless you choose to start a job from a conversation, which works the same way as jobs from a text above.

**How you use the app**
- A record of key actions, such as signing up, starting a recording, starting a job from a text, sending or receiving a text on your business number (counts only, never the text), and creating, sending or getting paid for an invoice, with the time, your trade, country and province or state, and your plan.
- These records hold no customer details, prices or transcripts. They stay in our own database (no analytics companies) and are deleted with your account.

**Voice recordings and transcripts**
- When you record a job, the audio is sent to our speech-to-text provider to be turned into text. The audio is kept on your phone only until it's sent (or you cancel), then deleted. We don't store it on our servers.
- The text (transcript) is used to fill in your invoice. You can save it with the job by turning on "Save transcripts". Until you do, it isn't kept. You can delete a saved transcript from its job at any time, and turning the setting off deletes all saved transcripts.
- Your recordings and transcripts aren't used to train AI models. We've opted out of Deepgram's model improvement program, and Anthropic doesn't train its models on data sent through its API.

**What we don't collect**
- We don't use advertising trackers or sell data to advertisers.
- We don't track your location. Addresses are only what you enter or say.
- We don't read your contacts, messages or photos on our own. The app only uses the camera, a photo, a screenshot or text you paste when you choose it in the app.

## Why we use it

- To make your invoices, send them to your customers and keep your records.
- To track jobs, equipment, warranty registrations and claims for you.
- To keep your account secure and the app working, and to fix problems.
- To understand how the app is used and where people find it, so we can improve it.
- To contact you about your account or important changes.

We don't use your data or your customers' data for advertising.

If we ever want to use information that can't identify you or your customers, such as average job prices across a region, we will ask for your separate permission first. Saying no won't affect your use of the app.

## Your customers' information

You decide what customer information goes into Trade Clerks. We store it for you to run your business and only use it to provide the app to you. We don't contact your customers, except to deliver an invoice you send. When you send an invoice, it is emailed from Trade Clerks with your email address as the reply-to, so their replies come to you.

If one of your customers asks us about their information, we'll pass the request on to you and help you deal with it.

## Who helps us run the app

We use these providers to run Trade Clerks. Each one only gets what it needs for its task, and they are required to protect it.

| Provider | What it does | What it receives |
|---|---|---|
| Supabase | Database, sign-in, file storage, server functions | Everything you store in the app |
| Deepgram | Speech-to-text | The audio of your recordings |
| Anthropic (Claude) | AI that turns your words into an invoice, reads equipment rating plates, and reads customers' texts to start a job | Transcripts, your current invoice when you add to it, your trade and country, rating plate photos you add, and the screenshots or text you choose for a job from a text (with your business name, phone and email, so your own details aren't mistaken for the customer's) |
| Resend | Sending invoice emails, and sign-in emails to you (codes to confirm your email or reset your password) | For invoices: your customer's email address, the invoice PDF, your business name and reply-to email. When you choose to send one, an email telling your customer their equipment was registered, or asking them to register their own equipment, with the unit's brand, type, model, serial number and install date, the address it's installed at, their name and contact details as the form asks for them, your business name and contact details, the manufacturer's registration link and the registration deadline. For sign-in emails: your email address and the code |
| remove.bg and Vectorizer.ai | Cleaning up your logo when you upload it (removing the background and redrawing it sharp) | Your logo image |
| Twilio | Your business phone number and the texts on it, if your plan includes one | Your customers' phone numbers and the text of messages sent and received on your business number, and your verified cell number. Twilio keeps its own logs of messages for a period under its policy; we delete them when you delete your account |

Your recordings, transcripts, photos and screenshots aren't used to train AI models: we've opted out of Deepgram's model improvement program, and Anthropic doesn't train on data sent through its API.

Your information is stored in the United States (our Supabase database and files are in Oregon), and these providers may also process it in the United States. There it may be accessible to authorities under local law.

We may share information if the law requires it, or to protect someone's safety. If Trade Clerks is sold or merged, your data would move to the new owner under this same policy, and we would tell you first.

## Your logo

Your logo is stored at a web address so it can appear on your invoices and emails. Anyone with that exact address can view the logo image. Nothing else you store is public.

## How long we keep it

- Everything stays in your account until you delete it, or delete your account.
- Tax rules may require you to keep invoices for several years (6 years in Canada). Keeping your own copies, for example with the year-end export (below), is your responsibility.
- When you delete your account, everything in it is deleted straight away: business details, customers, invoices, jobs, sites, equipment, photos, transcripts, your logo, and the texts on your business number. The number itself is released.
- If your plan stops including the business number, the number is held for 60 days (so you can get it back by resubscribing) and then released. The texts stay in your account.
- Copies in our backups are deleted within 7 days.

## Deleting things and your choices

- **Your account:** Menu → Delete account. It can't be undone. Invoices you have already emailed stay with the people you sent them to.
- **Transcripts:** delete one from its job, or turn off "Save transcripts" to delete them all.
- **Customers:** delete them in the app. Deleting a customer also deletes the texts with them on your business number. **Photos:** delete them from the job, except a unit's rating plate photo, which is kept as proof for warranty and rebate claims while the unit is recorded. **Equipment:** open the unit and tap Delete unit; its rating plate photo is deleted with it.
- **Year-end export:** Menu → Year-end export. You can export a year of invoices as PDFs, with spreadsheets of your invoices, line items, customers and jobs (including a version for QuickBooks). The export is made on your phone; we don't keep a copy. Once you save or share it, it's yours to look after: it holds your customers' names and contact details, so share it only with people who need it, like your accountant.
- You can ask us for a copy of the information we hold about you, or to correct it, at privacy@tradeclerks.com. We'll reply within 30 days.

## Security

Your data is sent over encrypted connections and is only visible to your account. Another account can't see your customers, jobs or photos. No system is perfectly secure; if a breach puts your information at real risk, we will tell you and the authorities as the law requires.

## Who the app is for

Trade Clerks is for businesses. You must be at least 18, or the age of majority where you live, to use it.

## Changes to this policy

If we make an important change, we'll tell you in the app and ask you to agree again before it applies to you. The version and date are at the top.

## Contact and complaints

Questions or requests: privacy@tradeclerks.com, or write to Steve Gligor, Trade Clerks, Burlington, Ontario, Canada. Steve Gligor is responsible for privacy at Trade Clerks.

If you're not happy with our answer, you can complain to the Office of the Privacy Commissioner of Canada (priv.gc.ca).
