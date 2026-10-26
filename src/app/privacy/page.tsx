import type { Metadata } from "next";
import LegalPage from "../LegalPage";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Privacy() {
  return (
    <LegalPage eyebrow="Second Shift" title="Privacy policy" updated="27 October 2026">
      <section>
        <h2>Who we are</h2>
        <p>
          Second Shift is a working prototype built by Jeremy Nduati for the FUSE Society Blueprint 2026 case competition.
          It is designed for Free Geek Toronto but is not yet an official Free Geek Toronto service. If Free Geek Toronto
          adopts it, Free Geek Toronto will publish its own policy and become responsible for the information collected.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <p>When a business pledges laptops, we collect:</p>
        <ul>
          <li>company name, contact name, work email and postal code</li>
          <li>details of the laptops (brand, model, year, quantity, condition, chargers)</li>
          <li>the chosen drop-off time, or a pickup address</li>
          <li>whether the company wants its name on the partner wall</li>
          <li>once laptops arrive: their serial numbers, the data-wipe method and who performed it</li>
        </ul>
        <p>Staff sign-in uses a single cookie that keeps staff signed in. We do not use advertising or tracking cookies, and we do not run analytics.</p>
      </section>

      <section>
        <h2>Why we use it</h2>
        <ul>
          <li>to tell you whether your laptops are a good fit and to arrange the drop-off or pickup</li>
          <li>to track your batch and issue your data-wipe certificate</li>
          <li>to show your company on the partner wall and impact page, only if you opted in</li>
          <li>to count total laptops reused, which is shown without naming anyone who did not opt in</li>
        </ul>
        <p>We never sell or rent your information, and we do not use it for marketing.</p>
      </section>

      <section>
        <h2>Who can see it</h2>
        <ul>
          <li>Your pledge page is private. Anyone with its link can see it, so keep the link to yourself.</li>
          <li>Your impact page has a separate public link. It shows only your company name and laptop numbers, never your name, email or address.</li>
          <li>Staff can see all pledge details after signing in.</li>
        </ul>
      </section>

      <section>
        <h2>Where it is stored</h2>
        <p>
          The site is hosted by Vercel and the information is stored in a MongoDB Atlas database. These providers may store
          data outside Canada.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <p>
          We keep pledge records while the batch is being processed and for up to 12 months afterwards, so that the
          certificate stays available. You can ask for your information to be deleted earlier.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can ask to see, correct or delete your information, or to be removed from the partner wall, by opening an
          issue on the project&apos;s{" "}
          <a href="https://github.com/jeremydev-c/second-shift/issues" className="text-brand underline">GitHub page</a>.
          Please do not post personal details there; we will reply and arrange the request privately.
        </p>
      </section>
    </LegalPage>
  );
}
