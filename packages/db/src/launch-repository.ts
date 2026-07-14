import { hash } from "bcryptjs";
import type {
  ClientOperationsRepository,
  ClientUserRecord,
  ProjectRecord
} from "@digicolony/shared";
import type { PrismaClient } from "@prisma/client";

export function createPrismaClientOperationsRepository(
  prisma: PrismaClient,
  options: { readonly defaultPassword?: string } = {}
): ClientOperationsRepository {
  return {
    async createClientUser(input): Promise<ClientUserRecord> {
      const user = await prisma.user.create({
        data: {
          email: input.email,
          name: input.name,
          role: input.role,
          client: {
            connect: { id: input.clientId }
          }
        }
      });

      await prisma.passwordCredential.create({
        data: {
          userId: user.id,
          passwordHash: await hash(options.defaultPassword ?? "ChangeMe123!", 12)
        }
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        clientId: user.clientId
      };
    },
    async listProjects(): Promise<readonly ProjectRecord[]> {
      const projects = await prisma.project.findMany({
        select: {
          id: true,
          clientId: true,
          name: true,
          archivedAt: true
        }
      });

      return projects;
    }
  };
}
