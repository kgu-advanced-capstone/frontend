export * from './generated/model';

import { MyProjectResponseStatus } from './generated/model';

/**
 * 하위 호환성을 위한 별칭 정의
 * Swagger의 enum 값이 MyProjectResponseStatus로 생성됨
 */
export type ProjectStatus = MyProjectResponseStatus;
export const ProjectStatus = MyProjectResponseStatus;
