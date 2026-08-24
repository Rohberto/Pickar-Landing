import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "../styles/Legal.module.css";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy — Pickar</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content="Read Pickar's Privacy Policy to learn how we collect, use, and protect your personal information."
        />
        <link rel="canonical" href="https://usepickar.com/privacy" />
      </Head>

      <div className={styles.page}>
        <Navbar />

        <header className={styles.header}>
          <span className={styles.eyebrow}>Legal</span>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>
            Your privacy matters to us. This policy explains what information Pickar collects
            and how it&apos;s used.
          </p>
        </header>

        <div className={styles.content}>
          <p className={styles.updated}>Last updated: August 24, 2026</p>

          <div className={styles.section}>
            <h2>1. Introduction</h2>
            <p>
              This Privacy Policy describes how Pickar Enterprises Limited (&quot;Pickar,&quot;
              &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares
              information when you use the Pickar mobile application and related services (the
              &quot;Services&quot;), whether as a customer or as a driver. By using the Services,
              you agree to the collection and use of information in accordance with this policy.
            </p>
          </div>

          <div className={styles.section}>
            <h2>2. Information We Collect</h2>
            <p>We collect the following categories of information:</p>
            <ul>
              <li>
                <strong>Account information</strong> — your name, email address, phone number,
                and password when you create an account.
              </li>
              <li>
                <strong>Location data</strong> — real-time GPS location while using the app, so we
                can match you with nearby drivers, show live tracking, and calculate routes and
                delivery fees.
              </li>
              <li>
                <strong>Delivery information</strong> — pickup and drop-off addresses, recipient
                details, and package information you provide when booking a delivery.
              </li>
              <li>
                <strong>Payment information</strong> — wallet balance and transaction history.
                Card and bank details are collected and processed directly by our payment
                processor, Paystack; Pickar does not store your full card or bank account
                numbers.
              </li>
              <li>
                <strong>Driver information</strong> — for drivers, we additionally collect vehicle
                details, plate number, registered ride type, and any verification documents
                required to operate on the platform.
              </li>
              <li>
                <strong>Usage and device data</strong> — app interactions, device type, operating
                system, and log data collected automatically to help us maintain and improve the
                Services.
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Create and manage your account</li>
              <li>Match customers with available drivers and facilitate deliveries</li>
              <li>Process payments and maintain your wallet</li>
              <li>Provide live tracking, notifications, and customer support</li>
              <li>Maintain safety and prevent fraud</li>
              <li>Improve and develop new features for the Services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div className={styles.section}>
            <h2>4. How We Share Your Information</h2>
            <p>We share information only as necessary to operate the Services:</p>
            <ul>
              <li>
                Between customers and drivers, we share the minimum information needed to
                complete a delivery — such as name, phone number, pickup/drop-off location, and
                live location during an active delivery.
              </li>
              <li>
                With Paystack, our payment processor, to facilitate wallet funding and
                transactions.
              </li>
              <li>With service providers who help us operate the app (e.g. mapping, hosting, and messaging providers), under confidentiality obligations.</li>
              <li>When required by law, regulation, or legal process.</li>
            </ul>
            <p>We do not sell your personal information to third parties.</p>
          </div>

          <div className={styles.section}>
            <h2>5. Data Retention</h2>
            <p>
              We retain your information for as long as your account is active or as needed to
              provide the Services, comply with legal obligations, resolve disputes, and enforce
              our agreements.
            </p>
          </div>

          <div className={styles.section}>
            <h2>6. Data Security</h2>
            <p>
              We take reasonable technical and organizational measures to protect your
              information from unauthorized access, loss, or misuse. However, no method of
              transmission or storage is completely secure, and we cannot guarantee absolute
              security.
            </p>
          </div>

          <div className={styles.section}>
            <h2>7. Your Rights</h2>
            <p>
              Subject to applicable law, including the Nigeria Data Protection Act, you have the
              right to access, correct, or request deletion of your personal information, and to
              object to or restrict certain processing. To exercise any of these rights, contact
              us using the details below.
            </p>
          </div>

          <div className={styles.section}>
            <h2>8. Children&apos;s Privacy</h2>
            <p>
              The Services are not intended for individuals under the age of 18. We do not
              knowingly collect personal information from children.
            </p>
          </div>

          <div className={styles.section}>
            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes by updating the &quot;Last updated&quot; date above or through the app.
            </p>
          </div>

          <div className={styles.section}>
            <h2>10. Contact Us</h2>
            <p>If you have questions about this Privacy Policy or wish to exercise your rights, contact us at:</p>
            <p>
              <strong>Pickar Enterprises Limited</strong>
              <br />
              24 Promiseland Road, So Easy Bustop, Ayobo, Lagos, Nigeria
              <br />
              Email: <a href="mailto:support@usepickar.com">support@usepickar.com</a>
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
