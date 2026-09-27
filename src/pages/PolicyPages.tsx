import React from 'react';

interface Props {
  type: 'terms' | 'privacy' | 'booking-policy' | 'cancellation-policy';
}

export const PolicyPages: React.FC<Props> = ({ type }) => {
  const content = {
    terms: {
      title: 'Terms of Play & House Rules',
      subtitle: 'CyberCraze – HQ Gaming Space Code of Conduct',
      sections: [
        {
          heading: '1. Esports Gear Care & Conduct',
          text: 'All tournament battlestations, mechanical keyboards, OLED displays, and Fanatec direct-drive cockpits are precision esports equipment. Users agree to treat all assets with care. Rage-hitting, throwing peripherals, or intentional abuse will result in an immediate session termination and equipment damage liability.'
        },
        {
          heading: '2. Zero Toxicity Policy',
          text: 'CyberCraze fosters a respectful, fiercely competitive yet welcoming atmosphere for all gamers. Hate speech, physical harassment, or disruptive behavior towards fellow players or staff is strictly prohibited.'
        },
        {
          heading: '3. Food & Beverages',
          text: 'Beverages with secure lids or cans are allowed at the side cup holders. Open hot gravies or sticky snacks are only permitted at the designated cafe bar lounge area.'
        }
      ]
    },
    privacy: {
      title: 'Privacy & Guest Data Policy',
      subtitle: 'How we respect your mobile identifier',
      sections: [
        {
          heading: '1. No Forced Accounts or Passwords',
          text: 'We respect your speed and privacy. We do not require passwords or account creation to book gaming slots. Your mobile number serves exclusively as your reservation identifier.'
        },
        {
          heading: '2. How Data is Used',
          text: 'Your mobile phone and name are solely used for booking verification, check-in QR code validation at the front counter, and optional slot reminders. We never sell or share customer contact records.'
        },
        {
          heading: '3. Data Security',
          text: 'All booking records and access tokens are handled using secure database protocols.'
        }
      ]
    },
    'booking-policy': {
      title: 'Guest Reservation Policy',
      subtitle: 'Guidelines for booking and arrival',
      sections: [
        {
          heading: '1. 10-Minute Arrival Window',
          text: 'Please arrive at CyberCraze HQ at least 10 minutes prior to your scheduled session time. Show your digital QR pass at the frontdesk for instant check-in.'
        },
        {
          heading: '2. Grace Period & Holds',
          text: 'Stations are held for 15 minutes after start time. If a customer does not arrive or notify staff via WhatsApp within 15 minutes, the station may be released to waiting walk-in players.'
        },
        {
          heading: '3. Session Extensions',
          text: 'Sessions may be extended in 30-minute or 1-hour increments if no consecutive reservation is queued for that station.'
        }
      ]
    },
    'cancellation-policy': {
      title: 'Cancellation & Rescheduling',
      subtitle: 'Fair rules for gamers and cafe availability',
      sections: [
        {
          heading: '1. Free Cancellation Notice',
          text: 'You may cancel or reschedule your reservation for free up to 1 hour before your scheduled session time directly from the "Manage Booking" page without needing staff assistance.'
        },
        {
          heading: '2. Deposits & Credits',
          text: 'If a deposit was collected, cancellations made prior to the 1-hour cutoff will be credited back or rolled over to your next match booking via your phone number.'
        },
        {
          heading: '3. Rescheduling Rules',
          text: 'You can reschedule your slot to any future open time within 14 days, subject to station availability.'
        }
      ]
    }
  }[type];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
            Official Policies · Mymensingh HQ
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">
            {content.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {content.subtitle}
          </p>
        </div>

        <div className="bg-[#101624] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-8 shadow-card">
          {content.sections.map((sec) => (
            <div key={sec.heading} className="space-y-2">
              <h3 className="font-bold text-base text-white">{sec.heading}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {sec.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
