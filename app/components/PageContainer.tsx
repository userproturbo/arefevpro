type PageContainerProps = {
  children: React.ReactNode;
};

export default function PageContainer({ children }: PageContainerProps) {
  return <div className="max-w-4xl mx-auto px-6 py-12">{children}</div>;
}
