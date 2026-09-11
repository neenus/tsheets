// Rendered inside the pinned total bar, directly under the total.
const Footer = () => (
  <footer className="border-t border-line px-4 py-2 text-center text-xs text-muted">
    © {new Date().getFullYear()}{' '}
    <a href="https://nraccounting.ca" className="underline decoration-line underline-offset-4 hover:text-ink">
      NR Accounting & Business Advisors Inc.
    </a>
  </footer>
);

export default Footer;
