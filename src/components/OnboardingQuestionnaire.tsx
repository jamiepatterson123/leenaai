import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { formSchema, type FormSchema } from "@/schemas/onboardingSchema";
import { OnboardingFormField } from "./onboarding/FormField";
import { toast } from "sonner";

interface OnboardingQuestionnaireProps {
  onComplete: (data: FormSchema) => void;
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
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exerciseType: [],
    },
  });

  const questions = [
    {
      field: "age",
      label: "What is your age?",
      type: "number" as const,
    },
    {
      field: "gender",
      label: "What is your gender?",
      type: "radio" as const,
      options: [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
      ],
    },
    {
      field: "weight",
      label: "What is your current weight (in kg)?",
      type: "number" as const,
    },
    {
      field: "height",
      label: "What is your height (in cm)?",
      type: "number" as const,
    },
    {
      field: "activityLevel",
      label: "What is your activity level?",
      type: "select" as const,
      options: [
        { value: "sedentary", label: "Sedentary (desk job, minimal exercise)" },
        { value: "lightly_active", label: "Lightly Active (light exercise)" },
        { value: "moderately_active", label: "Moderately Active (exercise 3-5 days)" },
        { value: "very_active", label: "Very Active (intense exercise 6-7 days)" },
        { value: "extremely_active", label: "Extremely Active (professional athlete)" },
      ],
    },
    // Add more questions following the same pattern
  ];

  const currentQuestion = questions[currentStep];

  const handleNext = async () => {
    const isValid = await form.trigger(currentQuestion.field as keyof FormSchema);
    
    if (isValid) {
      if (currentStep < questions.length - 1) {
        // Save current step data (will be implemented with Supabase)
        toast.success("Progress saved!");
        onNextStep();
      } else {
        const isFormValid = await form.trigger();
        if (isFormValid) {
          onComplete(form.getValues());
        }
      }
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6">
        <div className="space-y-4">
          <OnboardingFormField
            form={form}
            fieldName={currentQuestion.field as keyof FormSchema}
            label={currentQuestion.label}
            type={currentQuestion.type}
            options={currentQuestion.options}
          />
        </div>
        
        <div className="flex justify-between">
          {currentStep > 0 && (
            <Button type="button" variant="outline" onClick={onPreviousStep}>
              Previous
            </Button>
          )}
          <Button type="button" onClick={handleNext}>
            {currentStep === questions.length - 1 ? "Complete" : "Next"}
          </Button>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-16 rounded-full ${
                index === currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </form>
    </Form>
  );
};

export default OnboardingQuestionnaire;
