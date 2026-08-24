import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../styles/Legal.module.css";

const faqs = [
  {
    q: "How do I book a delivery?",
    a: "Open the Pickar app, enter your pickup and drop-off addresses, choose a ride type (Standard, Eco Send, Express, or Truck), confirm the price, and you'll be matched with a nearby rider automatically.",
  },
  {
    q: "How do I track my delivery?",
    a: "Once a rider accepts your delivery, you can track their live location on the map from pickup all the way to drop-off, right inside the app.",
  },
  {
    q: "How do I pay for a delivery?",
    a: "Pickar uses an in-app wallet funded via Paystack. Top up your wallet with a card or bank transfer, and the delivery fee is deducted automatically when your ride is booked.",
  },
  {
    q: "What ride type should I choose?",
    a: "Standard is best for everyday parcels and errands, Eco Send is our most affordable bike option, Express prioritizes the fastest available rider, and Truck is for bulky items or large loads.",
  },
  {
    q: "How do I become a Pickar driver?",
    a: "Download the app, sign up as a driver, and register the ride type you'll be driving for along with your plate number. Note that your ride type can only be chosen once and can't be changed afterward, so pick carefully.",
  },
  {
    q: "Can I get a receipt for my delivery?",
    a: "Yes. After a delivery is completed, you can download a receipt directly from your ride history in the app.",
  },
  {
    q: "How do I delete my account or data?",
    a: "Email us at the address below with your request and we'll process it in line with our Privacy Policy.",
  },
];

export default function Support() {
  return (
    <>
      <Head>
        <title>Support — Pickar</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Get help with your Pickar account, deliveries, payments, and more. Contact our support team for assistance."
        />
        <link rel="canonical" href="https://usepickar.com/support" />
      </Head>

      <div className={styles.page}>
        <Navbar />

        <header className={styles.header}>
          <span className={styles.eyebrow}>Support</span>
          <h1 className={styles.title}>How can we help?</h1>
          <p className={styles.subtitle}>
            Find answers to common questions below, or reach out to our team directly.
          </p>
        </header>

        <div className={styles.content}>
          <div className={styles.contactCard}>
            <div className={styles.contactItem}>
              <h3>Email us</h3>
              <a href="mailto:support@usepickar.com">support@usepickar.com</a>
            </div>
            <div className={styles.contactItem}>
              <h3>Response time</h3>
              <span>Within 24–48 hours</span>
            </div>
            <div className={styles.contactItem} style={{ display: "flex", alignItems: "flex-end" }}>
              <a href="mailto:support@usepickar.com" className={styles.emailBtn}>
                Contact support
              </a>
            </div>
          </div>

          <div className={styles.section}>
            <h2>Frequently asked questions</h2>
          </div>

          {faqs.map((f) => (
            <div key={f.q} className={styles.faqItem}>
              <h3>{f.q}</h3>
              <p>{f.a}</p>
            </div>
          ))}

          <div className={styles.section} style={{ marginTop: "2.5rem" }}>
            <h2>Still need help?</h2>
            <p>
              If you couldn&apos;t find what you&apos;re looking for, email us at{" "}
              <a href="mailto:support@usepickar.com">support@usepickar.com</a> and we&apos;ll get
              back to you as soon as possible.
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
