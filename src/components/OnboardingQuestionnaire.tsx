import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  // Personal Information
  age: z.string().min(1, "Age is required"),
  gender: z.enum(["male", "female", "other"]),
  weight: z.string().min(1, "Weight is required"),
  height: z.string().min(1, "Height is required"),
  
  // Activity Level
  activityLevel: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
    "extremely_active"
  ]),
  
  // Goals
  primaryGoal: z.enum([
    "weight_loss",
    "weight_maintenance",
    "muscle_gain",
    "athletic_performance"
  ]),
  targetWeight: z.string().optional(),
  
  // Dietary Preferences
  diet: z.enum([
    "none",
    "vegan",
    "vegetarian",
    "paleo",
    "keto",
    "low_carb",
    "high_protein",
    "other"
  ]),
  
  // Exercise
  exerciseFrequency: z.string(),
  exerciseType: z.array(z.string()),
  
  // Lifestyle
  sleepHours: z.string(),
  stressLevel: z.enum(["low", "moderate", "high"]),
});

interface OnboardingQuestionnaireProps {
  onComplete: (data: z.infer<typeof formSchema>) => void;
  currentStep: number;
  onNextStep: () => void;
  onPreviousStep: () => void;
}

const OnboardingQuestionnaire = ({
  onComplete,
  currentStep,
  onNextStep,
  onPreviousStep,
}: OnboardingQuestionnaireProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exerciseType: [],
    },
  });

  const steps = [
    {
      title: "Personal Information",
      fields: ["age", "gender", "weight", "height"],
    },
    {
      title: "Activity & Goals",
      fields: ["activityLevel", "primaryGoal", "targetWeight"],
    },
    {
      title: "Diet & Exercise",
      fields: ["diet", "exerciseFrequency", "exerciseType"],
    },
    {
      title: "Lifestyle",
      fields: ["sleepHours", "stressLevel"],
    },
  ];

  const currentStepFields = steps[currentStep].fields;

  const renderField = (fieldName: string) => {
    switch (fieldName) {
      case "age":
        return (
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What is your age?</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "gender":
        return (
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What is your gender?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="male" />
                      </FormControl>
                      <FormLabel className="font-normal">Male</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="female" />
                      </FormControl>
                      <FormLabel className="font-normal">Female</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="other" />
                      </FormControl>
                      <FormLabel className="font-normal">Other</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case "activityLevel":
        return (
          <FormField
            control={form.control}
            name="activityLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What is your activity level?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your activity level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (desk job, minimal exercise)</SelectItem>
                    <SelectItem value="lightly_active">Lightly Active (light exercise)</SelectItem>
                    <SelectItem value="moderately_active">Moderately Active (exercise 3-5 days)</SelectItem>
                    <SelectItem value="very_active">Very Active (intense exercise 6-7 days)</SelectItem>
                    <SelectItem value="extremely_active">Extremely Active (professional athlete)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      // Add more field renderers as needed
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="space-y-4">
          {currentStepFields.map((fieldName) => (
            <div key={fieldName}>{renderField(fieldName)}</div>
          ))}
        </div>
        
        <div className="flex justify-between">
          {currentStep > 0 && (
            <Button type="button" variant="outline" onClick={onPreviousStep}>
              Previous
            </Button>
          )}
          <Button
            type="button"
            onClick={() => {
              if (currentStep < steps.length - 1) {
                onNextStep();
              } else {
                const isValid = form.trigger();
                if (isValid) {
                  onComplete(form.getValues());
                }
              }
            }}
          >
            {currentStep === steps.length - 1 ? "Complete" : "Next"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OnboardingQuestionnaire;