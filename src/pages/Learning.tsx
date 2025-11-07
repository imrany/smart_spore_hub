import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Session } from "@supabase/supabase-js";
import { BookOpen, Clock } from "lucide-react";
import learningImage from "@/assets/learning-mushroom.jpg";

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
}

const Learning = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
        loadCourses();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    setCourses(data || mockCourses);
  };

  // Mock courses for demonstration
  const mockCourses: Course[] = [
    {
      id: "1",
      title: "Introduction to Mushroom Cultivation",
      description: "Learn the basics of growing oyster and button mushrooms at home or on your farm.",
      duration: "2 hours",
      level: "beginner",
    },
    {
      id: "2",
      title: "Advanced Growing Techniques",
      description: "Master advanced methods for maximizing yield and quality of your mushroom harvest.",
      duration: "4 hours",
      level: "advanced",
    },
    {
      id: "3",
      title: "Mushroom Business Management",
      description: "Learn how to market, price, and sell your mushroom products effectively.",
      duration: "3 hours",
      level: "intermediate",
    },
    {
      id: "4",
      title: "Pest and Disease Control",
      description: "Identify and manage common mushroom cultivation problems and diseases.",
      duration: "2.5 hours",
      level: "intermediate",
    },
  ];

  const displayCourses = courses.length > 0 ? courses : mockCourses;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">E-Learning Center</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access comprehensive courses to improve your mushroom cultivation skills and business knowledge.
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-12 rounded-lg overflow-hidden shadow-lg">
          <img 
            src={learningImage} 
            alt="Mushroom cultivation training" 
            className="w-full h-64 object-cover"
          />
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <BookOpen className="w-8 h-8 text-accent" />
                  <Badge variant={course.level === "beginner" ? "secondary" : "default"}>
                    {course.level}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{course.duration}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Learning;
