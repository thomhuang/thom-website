import styles from './Policies.module.css';

export default function Policies() {
  return (
    <main className={styles.policies}>
      <h1 className={styles.title}>Policies</h1>
      <p className={styles.updated}>Last updated September 19, 2026</p>

      <section className={styles.section} aria-labelledby="returns-title">
        <h2 id="returns-title" className={styles.sectionTitle}>
          Returns &amp; Refunds
        </h2>
        <p>
          All sales are final. I don’t accept returns, exchanges, or refunds.
          Items are sold as-is, and any flaws are described in the listing.
          Please read the listing and its measurements carefully before buying.
        </p>
        <p>
          One exception: if an item sells out before I can fulfill your order, I
          cancel the order and refund you in full automatically.
        </p>
        <p>
          If something is wrong with your order, email me and I’ll work with you.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="shipping-title">
        <h2 id="shipping-title" className={styles.sectionTitle}>
          Shipping
        </h2>
        <p>
          I ship to US addresses only. Shipping is a flat $10 per order. Orders
          ship within 3–7 business days via USPS. Sales tax, where applicable, is
          calculated at checkout.
        </p>
        <p>
          Local pickup is available by arrangement. Email me before buying and
          we’ll set something up.
        </p>
        <p>
          I ship to the address you provide at checkout, so please make sure it’s
          correct. If a package is returned as undeliverable, contact me to
          arrange reshipment.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="terms-title">
        <h2 id="terms-title" className={styles.sectionTitle}>
          Terms of Service
        </h2>
        <p>By placing an order, you agree to these terms.</p>
        <ul className={styles.list}>
          <li>
            <strong>Order acceptance.</strong> Completing checkout is an offer to
            buy. I may cancel and refund an order if an item is out of stock, if
            there is a pricing or listing error, or if I can’t ship to the
            address provided.
          </li>
          <li>
            <strong>Listings and condition.</strong> Items are sold as-is.
            Condition and any flaws are described in the listing. Measurements
            are approximate and provided as a guide, not a guarantee of fit.
          </li>
          <li>
            <strong>Limitation of liability.</strong> To the extent permitted by
            law, my total liability for any order is limited to the amount you
            paid for it, and I’m not liable for indirect or consequential
            damages.
          </li>
          <li>
            <strong>Governing law.</strong> These terms are governed by the laws
            of the State of California, without regard to its conflict-of-law
            rules.
          </li>
          <li>
            <strong>Changes.</strong> I may update these terms. The version in
            effect when you place an order applies to that order.
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="privacy-title">
        <h2 id="privacy-title" className={styles.sectionTitle}>
          Privacy
        </h2>
        <ul className={styles.list}>
          <li>
            <strong>What I collect.</strong> Your name, email, shipping address,
            and order details are collected at checkout. Card and payment details
            are handled by Stripe and are never stored on this site. Signing in
            as the site owner uses a first-party authentication cookie.
          </li>
          <li>
            <strong>How I use it.</strong> To process and ship orders, send order
            emails, and respond to inquiries.
          </li>
          <li>
            <strong>Sharing.</strong> Stripe (payments) and Cloudflare (hosting,
            database, email). I don’t sell your personal information.
          </li>
          <li>
            <strong>Cookies and trackers.</strong> I don’t use third-party
            advertising or analytics trackers.
          </li>
          <li>
            <strong>Your rights.</strong> California residents may request
            access to or deletion of their personal information by emailing me.
          </li>
          <li>
            <strong>Retention.</strong> I keep order records as needed for
            fulfillment and for legal and tax purposes.
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="contact-title">
        <h2 id="contact-title" className={styles.sectionTitle}>
          Contact
        </h2>
        <p>
          Thomas Huang —{' '}
          <a className={styles.link} href="mailto:thomaskhuangg@gmail.com">
            thomaskhuangg@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
