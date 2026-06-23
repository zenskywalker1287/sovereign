import { createFileRoute } from '@tanstack/react-router';
import { CourseView } from '@/features/courses/CourseView';
import { SPEECH_COURSE } from '@/domain/courses';

export const Route = createFileRoute('/brain/speech-course')({ component: () => <CourseView course={SPEECH_COURSE} /> });
