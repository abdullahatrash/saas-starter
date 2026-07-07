import Link from "next/link";

// Only link to routes that actually exist — a footer of 404s costs trust and
// crawl budget. Add legal/company links back as those pages get built.
const footerLinks = [
  { title: "Features", href: "/#features" },
  { title: "Pricing", href: "/pricing" },
  { title: "FAQ", href: "/#faq" },
  { title: "Studio", href: "/studio" },
  { title: "My Previews", href: "/previews" },
];

export default function FooterSection() {
  return (
    <footer className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <Link
          href="/"
          aria-label="go home"
          className="mx-auto block size-fit text-2xl font-bold"
        >
          Tattoos<span className="text-yellow-500">Try</span>
        </Link>

        <div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-primary block duration-150"
            >
              <span>{link.title}</span>
            </Link>
          ))}
        </div>
        <span className="text-muted-foreground block text-center text-sm">
          © {new Date().getFullYear()} FLOW LEAP. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
