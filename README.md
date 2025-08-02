# Jasper Hall Portfolio Site

A Next.js portfolio website featuring an interactive p5.js mind map visualization showcasing various creative projects and mediums.

## Features

- **Interactive Mind Map**: A dynamic, animated visualization built with p5.js
- **Responsive Design**: Adapts to different screen sizes and devices
- **Modern Tech Stack**: Next.js 14, TypeScript, Tailwind CSS
- **Smooth Animations**: Bezier curves, animated sub-branches, and hover effects
- **Touch Support**: Works on both desktop and mobile devices

## Sections

The mind map includes the following main sections:
- **purgeFiles**: Archives, YouTube content
- **jæce**: Live bookings, releases, links
- **xtsui**: Xtsuimart, archives
- **blog**: Blog section
- **shop**: Shop section
- **contact**: Email, Instagram, YouTube, newsletter
- **work**: Portfolio, CV, commissions

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd portfolio-site
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is configured for deployment on Vercel at `jasperhall.work`.

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Set the domain to `jasperhall.work`
3. Deploy automatically on push to main branch

## Customization

### Adding New Sections

To add new sections to the mind map, modify the `sections` array in `src/components/MindMap.tsx`:

```typescript
{
  name: "newSection",
  logo: newSectionLogo, // Optional
  branches: ["sub1", "sub2"], // Optional
  isVisible: false,
  branchAnimProgress: 0,
  angles: [PI / 4, PI / 2], // Required if branches exist
  distances: [80, 60], // Required if branches exist
}
```

### Styling

The project uses Tailwind CSS for styling. The mind map component accepts a `className` prop for custom styling.

### Images

- Place images in the `public/` directory
- Update image paths in the `preload()` function
- For external images, add domains to `next.config.js`

## Technical Details

### Architecture

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Animation**: p5.js for canvas-based animations
- **Type Safety**: TypeScript
- **Deployment**: Vercel

### Performance Optimizations

- p5.js package optimization in Next.js config
- Image optimization with Next.js Image component
- Lazy loading of components
- Efficient canvas rendering

## License

This project is private and proprietary to Jasper Hall.

## Contact

For questions or collaboration, reach out through the contact section in the mind map.
