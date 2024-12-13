# Neo Lecture Frontend Development Prompt

## Project Overview
Create a modern web application using React/Next.js that interfaces with the Neo Lecture API. The application should provide an intuitive interface for users to manage lecture content, create quizzes, and use flashcards for learning.

## Core Features

### Authentication
- Login/Register pages with email validation
- Protected routes for authenticated users
- Admin authentication with separate dashboard
- JWT token management and refresh mechanism

### File Management
- Drag-and-drop file upload interface
- Support for multiple file formats (PDF, DOCX, TXT, images)
- File preview functionality
- Progress indicators for file processing
- OCR toggle option for image uploads

### Content Generation
- AI-powered quiz generation interface
  - Configurable number of questions
  - Preview and edit generated questions
  - Save/discard options
- Flashcard generation interface
  - Customizable number of cards
  - Preview and edit capabilities
  - Spaced repetition settings

### Quiz System
- Quiz listing with search and filters
- Interactive quiz-taking interface
- Real-time scoring
- Review mode with explanations
- Progress tracking and analytics
- Quiz history and performance metrics

### Flashcard System
- Flashcard deck management
- Study mode with flip animation
- Confidence level tracking (1-5 scale)
- Spaced repetition algorithm implementation
- Due cards notification system

### Admin Dashboard
- User management interface
- System analytics and metrics
- Audit log viewer
- Content moderation tools
- Performance monitoring

## Technical Requirements

### Frontend Stack
- Next.js 14+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn UI for component library
- React Query for data fetching
- Zustand for state management
- React Hook Form for form handling
- Zod for schema validation

### Key Features
- Responsive design (mobile-first)
- Dark/light theme support
- Optimistic updates
- Error boundaries
- Loading states
- Toast notifications
- Infinite scrolling
- Search functionality
- Sorting and filtering
- Export capabilities

### Performance
- Code splitting
- Image optimization
- Lazy loading
- Caching strategies
- Performance monitoring

### Security
- Input validation
- XSS prevention
- CSRF protection
- Rate limiting handling
- Secure credential storage

## User Experience
- Clean, intuitive interface
- Consistent design language
- Helpful error messages
- Loading indicators
- Empty states
- Success feedback
- Keyboard shortcuts
- Accessibility compliance

## API Integration
- Proper error handling
- Request caching
- Token management
- Rate limit handling
- File upload progress
- Websocket integration (if needed)
- Retry mechanisms

## Deployment
- CI/CD pipeline
- Environment configuration
- Build optimization
- Analytics integration
- Error tracking
- Performance monitoring

## Documentation
- Setup instructions
- API documentation
- Component documentation
- State management patterns
- Testing guidelines