'use client';

import { useParams } from 'next/navigation';
import BlogForm from '../BlogForm';

export default function EditBlogPage() {
  const params = useParams();
  const id = params?.id;

  return <BlogForm mode="edit" blogId={id} />;
}
