import { createFileRoute } from '@tanstack/react-router';
import { CourseView } from '@/features/courses/CourseView';
import { MEYER_COURSE } from '@/domain/courses';

export const Route = createFileRoute('/brain/fiction')({ component: () => <CourseView course={MEYER_COURSE} /> });
