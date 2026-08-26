import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LegalSections from "../components/LegalSections";
import termsSections from "../data/termsContent";
import styles from "../styles/Legal.module.css";

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service — Pickar</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Read the Terms of Service governing your use of the Pickar mobile app, website, and delivery platform."
        />
        <link rel="canonical" href="https://usepickar.com/terms" />
      </Head>

      <div className={styles.page}>
        <Navbar />

        <header className={styles.header}>
          <span className={styles.eyebrow}>Legal</span>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>
            The terms governing your use of the Pickar mobile app, website, and delivery platform.
          </p>
        </header>

        <div className={styles.content}>
          <div className={styles.meta}>
            <strong>Effective Date:</strong> August 26, 2026
            <br />
            <strong>Last Updated:</strong> August 26, 2026
            <br />
            <strong>Company:</strong> Pickar Enterprises Limited
            <br />
            <strong>CAC Registration Number:</strong> RC8162047
            <br />
            <strong>Customer Support:</strong>{" "}
            <a href="mailto:support@usepickar.com">support@usepickar.com</a>
            <br />
            <strong>Website:</strong>{" "}
            <a href="https://www.usepickar.com">www.usepickar.com</a>
          </div>

          <LegalSections sections={termsSections} />
        </div>

        <Footer />
      </div>
    </>
  );
}
