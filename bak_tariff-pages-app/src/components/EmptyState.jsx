const messages = {
  idle: {
    title: '제품을 선택해주세요.',
    description: '제품을 먼저 선택하면 국가 조회 조건을 이어서 고를 수 있습니다.',
  },
  waiting: {
    title: '국가를 선택해주세요.',
    description: '수입국 또는 수출국을 선택해주세요.',
  },
  'detail-empty': {
    title: '해당 조합의 데이터가 없습니다.',
    description: '선택한 제품/수입국/수출국 조합에 매칭되는 HS 행을 찾지 못했습니다.',
  },
};

export default function EmptyState({ type }) {
  const message = messages[type] ?? messages.waiting;

  return (
    <section className="panel empty-state">
      <h2>{message.title}</h2>
      <p>{message.description}</p>
    </section>
  );
}
