import { Check } from "lucide-react";
export default function CorrectPopup() {
  return (
    <div className="correct-popup" role="status">
      <Check size={24} strokeWidth={3} />
      <strong>Correct!</strong>
    </div>
  );
}
