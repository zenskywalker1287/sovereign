import { createFileRoute } from '@tanstack/react-router';
import { CourseView } from '@/features/courses/CourseView';
import { HALBERT_COURSE } from '@/domain/courses';

export const Route = createFileRoute('/brain/copy')({ component: () => <CourseView course={HALBERT_COURSE} /> });
