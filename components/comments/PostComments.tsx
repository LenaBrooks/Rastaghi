import { CommentsSection } from "@/components/comments/CommentsSection";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  buildCommentTree,
  getCommentsForPost,
} from "@/lib/comments";
import { getCommentMode } from "@/lib/settings";
import { peekVisitorId } from "@/lib/visitor";

type PostCommentsProps = {
  postSlug: string;
};

/** Cookie/auth-bound comments block — streamed via Suspense on the post page. */
export async function PostComments({ postSlug }: PostCommentsProps) {
  const [visitorId, commentMode, isAdmin] = await Promise.all([
    peekVisitorId(),
    getCommentMode(),
    isAdminAuthenticated(),
  ]);
  const flatComments = await getCommentsForPost(postSlug, visitorId);
  const commentTree = buildCommentTree(flatComments);

  return (
    <CommentsSection
      postSlug={postSlug}
      tree={commentTree}
      totalCount={flatComments.length}
      isAdmin={isAdmin}
      commentMode={commentMode}
    />
  );
}
