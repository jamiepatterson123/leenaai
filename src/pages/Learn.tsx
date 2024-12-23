import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Learn = () => {
  const resources = [
    {
      title: "Nutrition Basics",
      description: "Learn about macronutrients, micronutrients, and how they affect your body.",
    },
    {
      title: "Workout Fundamentals",
      description: "Understand different types of exercises and how to build an effective workout routine.",
    },
    {
      title: "Recovery & Sleep",
      description: "Discover the importance of rest and how to optimize your recovery.",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Learning Center</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{resource.title}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <button className="text-primary hover:underline">Learn more →</button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Learn;