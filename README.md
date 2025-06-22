# AI Product Detector

A modern web application that uses Google's Gemini AI to detect products in images. Upload a photo and specify which products you want to find, and the AI will analyze the image and provide confidence scores for each product.

## Features

- 🖼️ **Image Upload**: Drag and drop or click to upload images
- 🔍 **Multi-Product Detection**: Search for multiple products in a single image
- 🎯 **Confidence Scoring**: Get scores from 0-10 for each product
- 🤖 **AI-Powered**: Uses Google Gemini AI for accurate analysis
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 📱 **Responsive Design**: Works on all devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google AI API key (Gemini)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd yeah-mam
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your Google AI API key:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env.local` file

## How to Use

1. **Upload an Image**: Click the upload area or drag and drop an image file
2. **Add Products**: List the products you want to detect (e.g., "iPhone", "Coca Cola", "Nike shoes")
3. **Analyze**: Click "Analyze Image" to run the AI detection
4. **View Results**: See confidence scores and reasoning for each product
5. **Try Again**: Use "Try Another Image" to start over

## Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Google Gemini AI** - Image analysis
- **Lucide React** - Icons

## Project Structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/           # shadcn/ui components
│   └── ProductDetector.tsx
└── lib/
    └── utils.ts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
