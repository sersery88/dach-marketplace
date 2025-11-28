import { CheckCircle, Search, MessageCircle, CreditCard } from 'lucide-react';

export function HowItWorks() {

  const steps = [
    { icon: Search, title: 'Experten finden', desc: 'Durchsuchen Sie unsere verifizierten Automatisierungs-Experten und finden Sie den perfekten Match für Ihr Projekt.' },
    { icon: MessageCircle, title: 'Projekt besprechen', desc: 'Kontaktieren Sie Experten direkt, besprechen Sie Ihre Anforderungen und erhalten Sie maßgeschneiderte Angebote.' },
    { icon: CreditCard, title: 'Sicher bezahlen', desc: 'Nutzen Sie unser Escrow-System für sichere Zahlungen. Das Geld wird erst freigegeben, wenn Sie zufrieden sind.' },
    { icon: CheckCircle, title: 'Projekt abschließen', desc: 'Erhalten Sie Ihre Automatisierungslösung, geben Sie Feedback und bewerten Sie den Experten.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">So funktioniert's</h1>
          <p className="text-xl text-gray-600">In 4 einfachen Schritten zu Ihrer Automatisierungslösung</p>
        </div>
        
        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-6 items-start bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <step.icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-blue-600">Schritt {index + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a href="/experts" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
            Jetzt Experten finden
          </a>
        </div>
      </div>
    </div>
  );
}

