import { BarChart, Users, Cloud, Receipt, FileText, Quote } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Receipt className="h-8 w-8 text-secondary" />,
      title: 'Track Sales & Receipts',
      description: 'Easily record every sale and generate professional receipts in seconds.',
    },
    {
      icon: <FileText className="h-8 w-8 text-secondary" />,
      title: 'Create Invoices & Quotes',
      description: 'Generate and send invoices and quotations to your clients with just a few clicks.',
    },
    {
      icon: <BarChart className="h-8 w-8 text-secondary" />,
      title: 'Analyze Your Profits',
      description: 'Get a clear view of your financial performance with insightful analytics.',
    },
    {
      icon: <Users className="h-8 w-8 text-secondary" />,
      title: 'Manage Customers',
      description: 'Keep track of your customer information and purchase history.',
    },
     {
      icon: <Cloud className="h-8 w-8 text-secondary" />,
      title: 'Cloud-Based',
      description: 'Access your data from anywhere, at any time, on any device.',
    },
    {
      icon: <Quote className="h-8 w-8 text-secondary" />,
      title: 'And much more...',
      description: 'Inventory management, expense tracking, business settings and more.',
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 md:text-4xl">
            Everything you need to run your business
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600">
            A powerful, yet simple-to-use tool for small businesses.
          </p>
        </div>
        <div className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white p-6 sm:p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
              <div className="shrink-0">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-lg sm:text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-sm sm:text-base text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
