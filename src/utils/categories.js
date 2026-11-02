// Trivia API's category `value` is its ID and `label` is what users see and what gets saved as category_name on scores.
export const CATEGORIES = [
  { value: "arts_and_literature", label: "Arts & Literature", icon: "🎨" },
  { value: "film_and_tv", label: "Film & TV", icon: "🎬" },
  { value: "food_and_drink", label: "Food & Drink", icon: "🍕" },
  { value: "general_knowledge", label: "General Knowledge", icon: "🧠" },
  { value: "geography", label: "Geography", icon: "🌍" },
  { value: "history", label: "History", icon: "📚" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "science", label: "Science", icon: "🔬" },
  { value: "society_and_culture", label: "Society & Culture", icon: "👥" },
  { value: "sport_and_leisure", label: "Sport & Leisure", icon: "⚽" },
];

export const findCategory = (value) => CATEGORIES.find((c) => c.value === value);

export const getCategoryLabel = (value) => findCategory(value)?.label ?? "Category";