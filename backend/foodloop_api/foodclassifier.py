import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
from transformers import (
    DistilBertTokenizer,
    DistilBertForSequenceClassification,
    Trainer,
    TrainingArguments
)
import torch
from torch.utils.data import Dataset

# Load dataset present as expanded_food_item.csv
df = pd.read_csv(r"e:\Namrata\programming\using git\FoodLoop\backend\foodloop_api\expanded_food_items.csv")

# Encode labels
label_encoder = LabelEncoder()
df["label_encoded"] = label_encoder.fit_transform(df["label"])
df["label_encoded"] = df["label_encoded"].astype("int64")

# Create label mappings
id2label = dict(enumerate(label_encoder.classes_))
label2id = {v: k for k, v in id2label.items()}

# Train-test split
train_texts, eval_texts, train_labels, eval_labels = train_test_split(
    df["text"].tolist(),
    df["label_encoded"].tolist(),
    test_size=0.2,
    random_state=42,
    stratify=df["label_encoded"]  # preserves label balance
)

# Tokenizer
tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
train_encodings = tokenizer(train_texts, truncation=True, padding=True)
eval_encodings = tokenizer(eval_texts, truncation=True, padding=True)

# Custom Dataset class
class FoodDataset(Dataset):
    def __init__(self, encodings, labels):
        self.encodings = encodings
        self.labels = labels

    def __getitem__(self, idx):
        item = {key: torch.tensor(val[idx]) for key, val in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item

    def __len__(self):
        return len(self.labels)


# Prepare Datasets
train_dataset = FoodDataset(train_encodings, train_labels)
eval_dataset = FoodDataset(eval_encodings, eval_labels)

# Load model
model = DistilBertForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=len(label_encoder.classes_),
    id2label=id2label,
    label2id=label2id
)

# Accuracy calculation
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=1)
    acc = accuracy_score(labels, predictions)
    return {"accuracy": acc}

# Training args
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=5,
    per_device_train_batch_size=8,
    evaluation_strategy="epoch",
    save_strategy="no",
    learning_rate=2e-5,
    weight_decay=0.01,
    logging_dir="./logs"
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    compute_metrics=compute_metrics
)

# Train and evaluate
trainer.train()
results = trainer.evaluate()
print("Final Evaluation:", results)

# Save model
model.save_pretrained("./fine_tuned_food_classifier")
tokenizer.save_pretrained("./fine_tuned_food_classifier")

# Inference function
def predict(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    outputs = model(**inputs)
    predicted_label_id = torch.argmax(outputs.logits, dim=1).item()
    return id2label[predicted_label_id]

# Example usage
print("Prediction:", predict("paneer butter masala"))
print("Prediction:", predict("dosa"))
print("Prediction:", predict("fried rice"))





# import pandas as pd
# data = {
#     "text": [
#         "eggs and toast", "chicken biryani", "coffee and biscuits",
#         "burger and fries", "idli sambar", "pasta with sauce",
#         "fruit salad", "dal rice", "chips and coke",
#         "pancakes with syrup", "grilled cheese sandwich", "momos",
#         "noodles with veggies", "oats with milk", "roti sabzi",
#         "vada pav", "upma", "ice cream", "samosa", "sandwich and juice",
#         "poha", "aloo paratha", "chai and rusk", "masala dosa",
#         "rajma chawal", "butter naan and paneer", "fish curry and rice",
#         "lemon rice", "methi thepla", "bread pakora",
#         "pav bhaji", "kathi roll", "misal pav", "veg biryani",
#         "maggie noodles", "uttapam", "kanda poha", "sev puri",
#         "moong dal chilla", "kachori and jalebi",
#         "medu vada", "pongal", "rava dosa", "sambar rice",
#         "curd rice", "banana chips", "bisi bele bath", "appam with stew",
#         "rasam rice", "mangalore buns","pesarattu", "ragi dosa", "keema pav", "aloo puri", "beetroot cutlet",
#         "chole bhature", "masala puri", "puliogare", "kharabath", "akhni pulao",
#         "malabar parotta with curry", "mushroom masala", "vegetable stew", 
#         "palak paneer", "tamarind rice", "sabudana khichdi", "sprouts salad",
#         "corn chaat", "paneer tikka", "rajma tikki", "methi paratha", 
#         "gobi manchurian", "egg curry", "veg kurma", "kootu curry","moong dal halwa", "kachumber salad", "jeera rice", "avial",
#         "daliya porridge", "sabudana vada", "vegetable pulao", 
#         "baingan bharta", "kal dosa", "aloo tikki chaat", "sattu paratha",
#         "tomato bath", "egg bhurji", "makki di roti and sarson da saag",
#         "kofta curry", "lauki chana dal", "khichdi", "patra", 
#         "idiyappam with coconut milk", "thayir sadam", "thukpa", 
#         "paneer bhurji", "veg fried rice", "dal makhani", "paneer paratha",
#         "paneer butter masala", "chicken tikka masala", "malai kofta",
#         "dal tadka", "butter chicken", "veg handi", "chicken korma",
#         "shahi paneer", "matar paneer", "veg jalfrezi", "chicken 65",
#         "tandoori roti and sabzi", "garlic naan and paneer", "rumali roti with kebab",
#         "methi malai matar", "dum aloo", "bhindi masala", "egg masala curry",
#         "veg kolhapuri", "mushroom do pyaza",
#         "veg fried rice", "chicken fried rice", "egg fried rice", "veg hakka noodles",
#         "chicken hakka noodles", "schezwan noodles", "spaghetti with marinara sauce",
#         "penne arrabbiata", "mac and cheese", "vegetable pasta", "prawn biryani",
#         "mutton biryani", "chicken biryani", "veg biryani", "hyderabadi biryani",
#         "tandoori chicken biryani", "fried rice with paneer", "vegetable pulao", "pulao",
#         "vegetable chowmein", "veg spaghetti", "chicken spaghetti", "garlic bread with pasta",
#         "coke", "pepsi", "lemon soda", "orange juice", "apple juice",
#         "buttermilk", "lassi", "masala chai", "filter coffee", "sweet lime soda",
#         "tea", "green tea", "mint lemonade", "nimbu pani", "mango lassi",
#         "thums up", "ginger tea", "milkshake", "coconut water", "fruit punch",
#         "sugarcane juice", "milk tea", "chilled coffee", "falooda",
#         "badam milk", "rose milk", "watermelon juice",
#         "vegetable pizza", "cheese pizza", "pepperoni pizza", "margarita pizza",
#         "chicken burger", "veg burger", "cheese burger", "paneer tikka burger",
#         "chicken wings", "grilled chicken sandwich", "prawn burger", "fish burger",
#         "tomato soup", "sweet corn soup", "vegetable soup", "lentil soup",
#         "mushroom soup", "pumpkin soup", "hot and sour soup", "manchow soup",
#         "clear soup", "cream of tomato soup", "chicken clear soup", "spicy tomato soup",
#         "roti", "chapati", "naan", "garlic naan", "butter naan", "tandoori roti",
#         "laccha paratha", "aloo paratha", "methi paratha", "paneer paratha", 
#         "gobi paratha", "makki di roti", "khakra", "paratha with curd", "rumali roti",
#         "thepla", "bajra roti", "jowar roti", "pudina paratha", "dosa", 
#         "masala dosa", "rava dosa",
        
#     ],
#     "label": [
#         "breakfast", "lunch", "snacks",
#         "dinner", "breakfast", "dinner",
#         "snacks", "lunch", "snacks",
#         "breakfast", "snacks", "snacks",
#         "dinner", "breakfast", "lunch",
#         "snacks", "breakfast", "snacks", "snacks", "snacks",
#         "breakfast", "breakfast", "snacks", "breakfast",
#         "lunch", "dinner", "dinner",
#         "lunch", "breakfast", "snacks",
#         "dinner", "dinner", "snacks", "dinner",
#         "snacks", "breakfast", "breakfast", "snacks",
#         "breakfast", "snacks",
#         "snacks", "breakfast", "breakfast", "lunch",
#         "lunch", "snacks", "lunch", "breakfast",
#         "lunch", "breakfast",
#         "breakfast", "breakfast", "snacks", "breakfast", "snacks",
#         "lunch", "snacks", "lunch", "breakfast", "lunch",
#         "dinner", "dinner", "dinner",
#         "dinner", "lunch", "breakfast", "snacks",
#         "snacks", "snacks", "breakfast",
#         "snacks", "dinner", "dinner", "lunch",
#          "snacks", "snacks", "lunch", "lunch",
#         "breakfast", "snacks", "lunch",
#         "dinner", "breakfast", "snacks", "breakfast",
#         "breakfast", "breakfast", "lunch",
#         "dinner", "lunch", "dinner", "snacks",
#         "breakfast", "lunch", "dinner",
#         "breakfast", "lunch", "dinner", "breakfast",
#         "dinner", "dinner", "dinner",
#         "lunch", "dinner", "dinner", "dinner",
#         "dinner", "lunch", "lunch", "snacks",
#         "dinner", "dinner", "dinner",
#         "lunch", "lunch", "lunch", "dinner",
#         "dinner", "lunch","lunch", "lunch", "lunch", "snacks",
#         "snacks", "snacks", "dinner", "dinner",
#         "dinner", "dinner", "lunch", "lunch", "lunch",
#         "lunch", "lunch", "dinner", "lunch", "lunch",
#         "snacks", "dinner", "dinner", "dinner",
#         "snacks", "snacks", "snacks", "snacks", "snacks",
#         "breakfast", "breakfast", "snacks", "breakfast", "snacks",
#         "snacks", "snacks", "snacks", "snacks", "breakfast",
#         "snacks", "snacks", "snacks", "snacks", "snacks",
#         "snacks", "snacks", "snacks", "snacks",
#         "snacks", "snacks","dinner", "dinner", "dinner", "dinner",
#         "snacks", "snacks", "snacks", "snacks",
#         "snacks", "snacks", "snacks", "snacks",
#         "lunch", "lunch", "lunch", "lunch",
#         "lunch", "lunch", "lunch", "lunch",
#         "lunch", "lunch", "lunch", "lunch",
#         "lunch", "lunch", "dinner", "dinner", "dinner", "dinner",
#         "lunch", "breakfast", "breakfast", "breakfast", 
#         "breakfast", "lunch", "snacks", "breakfast", "dinner",
#         "breakfast", "lunch", "lunch", "breakfast", "lunch",
#         "lunch", "lunch","breakfast",
#         "breakfast","breakfast"
#     ]
# }
# df = pd.DataFrame(data)
# df.to_csv("food_items.csv", index=False)
# print("CSV file has been created successfully!")
# print(len(data['text']))
# print(len(data['label']))
